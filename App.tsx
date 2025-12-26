import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { account, databases, USERS_COLLECTION_ID, DATABASE_ID, SCHOLARSHIPS_COLLECTION_ID, TRACKS_COLLECTION_ID } from './appwriteConfig';
import { Models, Query } from 'appwrite';
import { 
  cacheUserProfile, 
  getCachedUserProfile, 
  cacheUserSession,
  getCachedUserSession,
  cacheScholarships, 
  getCachedScholarships,
  cacheMatchedScholarships,
  getCachedMatchedScholarships 
} from './hooks/useOfflineSync';

import { Scholarship, Tab, UserProfile, Application } from './types';
import ScholarshipFinder from './components/ScholarshipFinder';
import EditProfile from './pages/EditProfile';
import CGPACalculator from './components/CGPACalculator';
import ToolsPage from './components/ToolsPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
// import AptitudeTestArena from './components/AptitudeTestArena';

import BottomNav from './components/BottomNav';

import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('finder');
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [wrappedScholarships, setWrappedScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const mountedRef = useRef(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Reset to finder tab when returning from edit-profile
    if (!location.pathname.includes('/edit-profile')) {
      setActiveTab('finder');
    }
  }, [location.pathname]);

  // Store applied scholarship IDs for later reconstruction
  const [appliedScholarshipIds, setAppliedScholarshipIds] = useState<string[]>([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // First, try to load cached data for instant UI
      const cachedProfile = getCachedUserProfile();
      const cachedUser = getCachedUserSession();
      const cachedScholarships = getCachedScholarships();
      const cachedMatched = getCachedMatchedScholarships();
      
      if (cachedProfile && cachedScholarships) {
        setUserProfile(cachedProfile as UserProfile);
        if (cachedUser) setUser(cachedUser);
        setAllScholarships(cachedScholarships);
        if (cachedMatched) {
          setWrappedScholarships(cachedMatched);
        }
        setIsLoading(false);
        setInitialDataLoaded(true);
      }

      try {
        const currentUser = await account.get();
        if (!mountedRef.current) return;
        
        // Check email verification BEFORE allowing access
        if (!currentUser.emailVerification) {
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
        cacheUserSession(currentUser);
        
        // Check for user profile in Appwrite Database
        try {
          const profileDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, currentUser.$id);
          const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...profileData } = profileDoc;
          const profile = profileData as unknown as UserProfile;
          setUserProfile(profile);
          // Cache the profile for offline use
          cacheUserProfile(profile);
          
          // Load applications from profile - it's a string array of scholarship IDs
          if (profileData.applications && Array.isArray(profileData.applications)) {
            setAppliedScholarshipIds(profileData.applications as string[]);
          }
        } catch (e) {
          if (!cachedProfile) {
            setUserProfile(null);
          }
        }
      } catch (error: any) {
        // If we have cached data and it's a network error (or we are offline), keep the session
        if ((cachedProfile || cachedUser) && (!navigator.onLine || error?.message === 'Network request failed')) {
             console.log("Staying in offline mode with cached data");
        } else {
            setUser(null);
            setUserProfile(null);
            navigate('/login'); // Redirect to login if session check fails
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, [navigate]);

  useEffect(() => {
    if (userProfile) {
      fetchAndMatchScholarships();
    }
  }, [userProfile]);

  // Reconstruct Application objects when we have both scholarship data and applied IDs
  useEffect(() => {
    if (allScholarships.length > 0 && appliedScholarshipIds.length > 0) {
      const reconstructedApps: Application[] = appliedScholarshipIds
        .map(scholarshipId => {
          const scholarship = allScholarships.find(s => s.id === scholarshipId);
          if (scholarship) {
            return {
              scholarshipId: scholarship.id,
              scholarshipName: scholarship.name,
              appliedAt: new Date().toISOString(), // We don't have original date, use current
              deadline: scholarship.deadline
            };
          }
          return null;
        })
        .filter((app): app is Application => app !== null);
      
      setApplications(reconstructedApps);
    }
  }, [allScholarships, appliedScholarshipIds]);

  const fetchAndMatchScholarships = useCallback(async () => {
    if (!userProfile) return;
    
    // If we already have cached data and still loading, skip the loading state
    if (!initialDataLoaded) {
      setIsLoadingScholarships(true);
    }
    
    try {
      // 1. Fetch all scholarships
      const scholarshipsResponse = await databases.listDocuments(
        DATABASE_ID,
        SCHOLARSHIPS_COLLECTION_ID,
        [Query.limit(1000)]
      );

      // 2. Fetch all eligibility tracks
      const tracksResponse = await databases.listDocuments(
        DATABASE_ID,
        TRACKS_COLLECTION_ID,
        [Query.limit(1000)]
      );

      // Helper to map DB doc to Scholarship type
      const mapToScholarship = (doc: any, matchReasons: string[] = []) => ({
        id: doc.$id,
        name: doc.scholarship_name || doc.title,
        provider: doc.provider,
        description: doc.description || `${doc.provider} scholarship`,
        eligibility: matchReasons,
        rewardAmount: doc.award_amount || doc.benefitInCash || 'N/A',
        deadline: doc.deadline || 'Varies',
        link: doc.official_link || doc.officialLink || '',
        status: (doc.is_active ? 'Open' : 'Closed') as 'Open' | 'Closed',
        modeOfSelection: doc.modeSelection || 'Not specified'
      });

      const all = scholarshipsResponse.documents.map(doc => mapToScholarship(doc));
      setAllScholarships(all);
      // Cache scholarships for offline use
      cacheScholarships(all);

      // 3. Perform Matching Logic (User vs Tracks) - CASE-INSENSITIVE
      const matchedScholarshipIds = new Set<string>();
      
      tracksResponse.documents.forEach((track: any) => {
        let isMatch = true;
        let failReason = "";

        // Level
        if (track.allowed_levels?.length > 0 && !track.allowed_levels.includes(userProfile.level)) {
             isMatch = false; failReason = `Level mismatch: track has ${JSON.stringify(track.allowed_levels)} (types: ${track.allowed_levels.map((l: any) => typeof l)}) but user has ${userProfile.level} (type: ${typeof userProfile.level})`;
        }
        
        // Check if user is 100 Level (they don't have CGPA yet)
        const userLevelNum = typeof userProfile.level === 'number' 
          ? userProfile.level 
          : parseInt(String(userProfile.level).replace(/\D/g, '')) || 0;
        const isUser100Level = userLevelNum === 100;
        
        // CGPA - SKIP for 100 Level students (they don't have CGPA yet)
        if (track.min_cgpa && !isUser100Level && userProfile.cgpa < track.min_cgpa) {
            isMatch = false; failReason = "CGPA too low";
        }
        
        // JAMB - FIX: Use >= instead of <
        if (track.min_jamb_score && userProfile.jamb < track.min_jamb_score) {
            isMatch = false; failReason = "JAMB too low";
        }
        
        // Gender - CASE INSENSITIVE
        if (track.required_gender && track.required_gender !== 'ANY' && 
            track.required_gender.toUpperCase() !== userProfile.gender.toUpperCase()) {
            isMatch = false; failReason = "Gender mismatch";
        }
        
        // Religion - CASE INSENSITIVE
        const trackReligion = (track.required_religion || 'NONE').toUpperCase();
        const userReligion = (userProfile.rel || '').toUpperCase();
        if (trackReligion !== 'NONE' && trackReligion !== 'ANY' && trackReligion !== userReligion) {
            isMatch = false; failReason = "Religion mismatch";
        }
        
        // State - CASE INSENSITIVE
        const stateList = track.required_state_of_origin || [];
        if (stateList.length > 0 && !stateList.includes('ALL')) {
            const stateListLower = stateList.map((s: string) => s.toLowerCase());
            if (!stateListLower.includes(userProfile.state.toLowerCase())) {
                isMatch = false; failReason = "State mismatch";
            }
        }
        
        // LGA - CASE INSENSITIVE
        const lgaList = track.required_lga_list || [];
        if (lgaList.length > 0 && userProfile.lga) {
            // Skip if LGA list only contains "None" or empty values
            const validLgas = lgaList.filter((l: string) => l && l.toUpperCase() !== 'NONE');
            if (validLgas.length > 0) {
                const lgaListLower = validLgas.map((l: string) => l.toLowerCase());
                if (!lgaListLower.includes(userProfile.lga.toLowerCase())) {
                    isMatch = false; failReason = `LGA mismatch: track requires ${JSON.stringify(validLgas)} but user has ${userProfile.lga}`;
                }
            }
        }
        
        // Course - CASE INSENSITIVE
        const courseList = track.course_category || [];
        if (courseList.length > 0 && !courseList.includes('ALL')) {
            const courseListLower = courseList.map((c: string) => c.toLowerCase());
            if (!courseListLower.includes(userProfile.course.toLowerCase())) {
                isMatch = false; failReason = "Course mismatch";
            }
        }
        
        // University - CASE INSENSITIVE
        const uniList = track.required_universities || [];
        if (uniList.length > 0 && !uniList.includes('ALL')) {
            const uniListLower = uniList.map((u: string) => u.toLowerCase());
            if (!uniListLower.includes(userProfile.uni.toLowerCase())) {
                isMatch = false; failReason = "University mismatch";
            }
        }
        
        // Booleans - STRICT CHECKS
        if (track.is_financial_need_required && !userProfile.finance) {
            isMatch = false; failReason = "Not indigent";
        }
        if (track.is_orphan_or_single_parent_required && !userProfile.orphan) {
            isMatch = false; failReason = "Not orphan";
        }
        
        // Disability check
        if (track.is_disability_specific && !userProfile.chal) {
            isMatch = false; failReason = "Not disabled";
        }

        if (isMatch) {
          matchedScholarshipIds.add(track.scholarship_id);
        }
      });

      const wrapped = all.filter(s => matchedScholarshipIds.has(s.id));
      
      setWrappedScholarships(wrapped);
      // Cache matched scholarships for offline use
      cacheMatchedScholarships(wrapped);

    } catch (error) {
      // Only clear if we don't have cached data
      if (!initialDataLoaded) {
        setAllScholarships([]);
        setWrappedScholarships([]);
      }
    } finally {
      setIsLoadingScholarships(false);
    }
  }, [userProfile, initialDataLoaded]);
  
  const handleSignOut = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserProfile(null);
      setAllScholarships([]);
      setWrappedScholarships([]);
      // Clear cached data on sign out
      localStorage.removeItem('user_profile');
      localStorage.removeItem('scholarships_cache');
      localStorage.removeItem('matched_scholarships_cache');
      navigate('/'); // Redirect to landing page
    } catch (error) {
        // Silent fail for sign out
    }
  }, [navigate]);

  const handleProfileUpdate = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    cacheUserProfile(updatedProfile);
  }, []);

  const handleApply = async (application: Application) => {
    if (!user) return;
    
    // Check if already applied
    if (applications.some(a => a.scholarshipId === application.scholarshipId)) {
      return;
    }
    
    const updatedApplications = [...applications, application];
    const updatedIds = [...appliedScholarshipIds, application.scholarshipId];
    
    // Optimistically update local state
    setApplications(updatedApplications);
    setAppliedScholarshipIds(updatedIds);
    
    // Save to Appwrite - store only the scholarship IDs as string array
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          applications: updatedIds
        }
      );
    } catch (error: any) {
      // Revert on error
      setApplications(applications);
      setAppliedScholarshipIds(appliedScholarshipIds);
    }
  };

  const renderContent = () => {
    // Show skeleton loader instead of spinner for faster perceived performance
    if (isLoading) {
      return (
        <div className="p-4 md:p-6">
          {/* Skeleton Header */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          {/* Skeleton Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!user && !userProfile) {
      return null;
    }

    if (!userProfile) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Profile Incomplete</h3>
            <p className="text-yellow-700 mb-4">
              We couldn't retrieve your profile details. This might happen if the signup process wasn't fully completed.
            </p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Sign Out & Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      default:
        return (
          <ScholarshipFinder
            allScholarships={allScholarships}
            wrappedScholarships={wrappedScholarships}
            userProfile={userProfile}
            isLoading={isLoadingScholarships}
            userName={userProfile.fullName || user?.name || 'Scholar'}
            applications={applications}
            onApply={handleApply}
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
        <div className="flex items-center gap-3">
          {/* Offline indicator */}
          {!isOnline && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Offline
            </span>
          )}
          {(user || userProfile) && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">{user?.email || userProfile?.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-semibold text-[#2240AF] bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="pb-24">
        <Routes>
          {userProfile && (
            <>
              <Route path="/edit-profile" element={<EditProfile userProfile={userProfile} userId={user?.$id || ''} onProfileUpdate={handleProfileUpdate} />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/cgpa-calculator" element={<CGPACalculator />} />
            </>
          )}
          <Route path="*" element={<div className="p-4 md:p-6">{renderContent()}</div>} />
        </Routes>
      </main>
      
      {userProfile && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      <PWAInstallPrompt />
    </div>
  );
};

export default App;