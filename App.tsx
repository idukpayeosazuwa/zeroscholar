import React, { useState, useEffect } from 'react';
import { account, databases, USERS_COLLECTION_ID, DATABASE_ID, SCHOLARSHIPS_COLLECTION_ID } from './appwriteConfig';
import { Models } from 'appwrite';

import { Scholarship, Tab, UserProfile, UniversityLevel } from './types';
import ScholarshipFinder from './components/ScholarshipFinder';
import AptitudeTestArena from './components/AptitudeTestArena';

import BottomNav from './components/BottomNav';

import Auth from './components/Auth';

import { LogoIcon } from './components/icons/LogoIcon';
import { sortScholarshipsByRelevance } from './utils/scholarshipMatcher';

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
          setUserProfile(profileData as unknown as UserProfile);
        } catch (e) {
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
      fetchAndMatchScholarships();
    }
  }, [userProfile]);

  const fetchAndMatchScholarships = async () => {
    if (!userProfile) return;
    
    setIsLoadingScholarships(true);
    try {
      // Fetch all scholarships from Appwrite
      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHOLARSHIPS_COLLECTION_ID
      );

      // Sort and filter scholarships based on user profile
      const matchedScholarships = sortScholarshipsByRelevance(
        response.documents,
        userProfile
      );

      // Transform to Scholarship type
      const scholarships: Scholarship[] = matchedScholarships.map((doc: any) => ({
        id: doc.$id,
        name: doc.title,
        provider: doc.provider,
        description: doc.description || `${doc.provider} scholarship`,
        eligibility: doc.matchData.reasons, // Show match reasons
        rewardAmount: doc.benefitInCash || 'N/A',
        deadline: doc.deadline || 'Varies',
        link: doc.officialLink || '',
        status: doc.status || 'Closed',
        modeOfSelection: doc.modeSelection || 'Not specified'
      }));

      setMatchedScholarships(scholarships);
    } catch (error) {
      console.error('Failed to fetch scholarships:', error);
      setMatchedScholarships([]);
    } finally {
      setIsLoadingScholarships(false);
    }
  };
  
  const handleAuthSuccess = async (authedUser: Models.User<Models.Preferences>, level: UniversityLevel) => {
    setUser(authedUser);
    
    // Fetch or create user profile
    try {
      const profileDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, authedUser.$id);
      const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...profileData } = profileDoc;
      setUserProfile(profileData as unknown as UserProfile);
    } catch (e) {
      // Profile doesn't exist, create it with the level from signup
    //   const newProfile: UserProfile = {
    //     fullName: authedUser.email,
    //     level: level
    //   };
    //   setUserProfile(newProfile);
    // }
    }
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserProfile(null);
      setMatchedScholarships([]);
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

    if (!user || !userProfile) {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    switch (activeTab) {
      case 'tests':
        return <AptitudeTestArena user={user} />;

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
            <LogoIcon className="h-8 w-8 text-[#2240AF]" />
            <h1 className="text-2xl font-bold text-[#2240AF]">ScholarAI</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-sm font-semibold text-[#2240AF] bg-blue-100 rounded-md hover:bg-blue-200"
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