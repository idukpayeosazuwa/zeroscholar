import React, { useState, useEffect } from 'react';
import { account, databases, USERS_COLLECTION_ID, DATABASE_ID } from './appwriteConfig';
import { Models } from 'appwrite';

import { Scholarship, Tab, UserProfile } from './types';
import ScholarshipFinder from './components/ScholarshipFinder';
import AptitudeTestArena from './components/AptitudeTestArena';
import CommunityBoard from './components/CommunityBoard';
import BottomNav from './components/BottomNav';
import UserProfileForm from './components/UserProfileForm';
import Auth from './components/Auth';
import { rawScholarshipData } from './data/scholarships';
import { fetchLiveDeadlines } from './services/geminiService';
import { LogoIcon } from './components/icons/LogoIcon';


// Helper to parse level requirements from strings like "Undergraduate (200L)" or "100L/200L"
const checkLevelMatch = (levelRequirement: string, userLevelStr: string): boolean => {
  const userLevel = parseInt(userLevelStr.match(/\d+/)?.[0] || '0');
  if (levelRequirement.toLowerCase().includes('postgraduate')) return false;
  if (userLevel === 0) return true; // Default to match if user level is weird

  const levels = levelRequirement.match(/\d{3}/g) || [];
  if (levels.length === 0) return true; // Matches if no specific level is required

  const isRange = levelRequirement.includes('/');
  const isMinimum = levelRequirement.includes('+');

  if (isMinimum) {
    return userLevel >= parseInt(levels[0]);
  }
  
  if (isRange) {
    return levels.some(lvl => userLevel === parseInt(lvl));
  }
  
  return levels.some(lvl => userLevel === parseInt(lvl));
};


// Helper to parse CGPA requirements from strings like "Minimum 3.5" or "≥3.5"
const checkCgpaMatch = (cgpaRequirement: string, userCgpa: number): boolean => {
  const reqGpaMatch = cgpaRequirement.match(/(\d\.\d+)/);
  if (!reqGpaMatch) return true; // Matches if no specific CGPA is required

  const reqGpa = parseFloat(reqGpaMatch[0]);
  return userCgpa >= reqGpa;
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('finder');
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchedScholarships, setMatchedScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        // Check for user profile in Appwrite Database
        try {
          const profileDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, currentUser.$id);
          const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...profileData } = profileDoc;
          // Fix: Type assertion to UserProfile after removing Appwrite metadata.
          // Using 'unknown' as an intermediate step is required for type safety.
          setUserProfile(profileData as unknown as UserProfile);
        } catch (e) {
            // User exists in Auth but not in DB, force profile creation
            setUserProfile(null);
        }
      } catch (error) {
        setUser(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setIsLoadingScholarships(true);

      const allScholarships: Scholarship[] = Object.entries(rawScholarshipData).map(([id, s]: [string, any]) => ({
        id: id,
        name: s.title,
        provider: s.provider,
        description: s.description,
        eligibility: [
          s.cgpa_requirement,
          `Level: ${s.level}`,
          `Courses: ${s.course_category}`
        ].filter(Boolean),
        rewardAmount: s.benefit_in_cash || 'N/A',
        deadline: s.deadline || 'Varies',
        link: s.official_link || '',
        status: s.status || 'Closed',
        modeOfSelection: s.mode_selection || 'Not specified'
      }));

      const profileMatches = allScholarships.filter(s => 
        checkCgpaMatch(s.eligibility[0] || '', userProfile.cgpa) &&
        checkLevelMatch(s.eligibility[1] || '', userProfile.level)
      );

      const fetchAndUpdateDeadlines = async () => {
        try {
          const scholarshipNames = profileMatches.map(s => s.name);
          if (scholarshipNames.length > 0) {
            const liveDeadlines = await fetchLiveDeadlines(scholarshipNames);
            const updatedMatches = profileMatches.map(scholarship => ({
              ...scholarship,
              deadline: liveDeadlines[scholarship.name] || scholarship.deadline,
            }));
            setMatchedScholarships(updatedMatches);
          } else {
             setMatchedScholarships([]);
          }
        } catch (error) {
          console.error("Failed to fetch live deadlines, using static data.", error);
          setMatchedScholarships(profileMatches);
        } finally {
          setIsLoadingScholarships(false);
        }
      };

      fetchAndUpdateDeadlines();
    }
  }, [userProfile]);
  
  const handleProfileSave = async (profile: UserProfile) => {
    if (user) {
      try {
        await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, profile);
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to save profile:", error);
        // Handle error (e.g., show a notification to the user)
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserProfile(null);
    } catch (error) {
        console.error("Failed to sign out:", error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-500 p-8">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4">Loading ZeroScholar...</p>
        </div>
      );
    }

    if (!user) {
      // Pass a function to Auth to update user state upon successful login/signup
      return <Auth onAuthSuccess={(authedUser) => setUser(authedUser)} />;
    }

    if (!userProfile) {
      return <UserProfileForm onSave={handleProfileSave} user={user} />;
    }

    switch (activeTab) {
      case 'tests':
        return <AptitudeTestArena user={user} />;
      case 'community':
        return <CommunityBoard user={user} userProfile={userProfile} />;
      case 'finder':
      default:
        return (
          <ScholarshipFinder
            scholarships={matchedScholarships}
            isLoading={isLoadingScholarships}
            userName={userProfile.fullName}
          />
        );
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-800">ZeroScholar</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
      
      <main className="pb-24">
        <div className="p-4 md:p-6">
          {renderContent()}
        </div>
      </main>
      
      {user && userProfile && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default App;