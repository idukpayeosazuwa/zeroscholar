import React, { useState, useMemo, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases, account } from '../appwriteConfig';
import { Scholarship, UserProfile, Application } from '../types';
import ScholarshipCard from './ScholarshipCard';
import { SearchIcon } from './icons/SearchIcon';

const DB_ID = 'scholarship_db';
const SCHOLARSHIP_COL_ID = 'scholarships';
const TRACKS_COL_ID = 'eligibility_tracks';
const USER_PROFILE_COL_ID = 'users';

type FilterStatus = 'matched' | 'applied';

interface ScholarshipFinderProps {
  allScholarships: Scholarship[];
  wrappedScholarships: Scholarship[];
  userProfile: UserProfile;
  isLoading: boolean;
  userName: string;
  applications: Application[];
  onApply: (application: Application) => Promise<void>;
}

interface UserProfileFromDB {
  $id: string;
  uid: string;
  level: number;
  cgpa: number;
  jamb: number;
  gender: string;
  state: string;
  lga: string;
  uni: string;
  course: string;
  finance: boolean;
  orphan: boolean;
  rel: string;
  chal: boolean;
  email: string;
  notified: string[];
}

interface ScholarshipWithTracks extends Scholarship {
  tracks?: any[];
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = '' }: { value: number, duration?: number, prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      
      setCount(Math.floor(easeOutQuart(progress) * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString()}</span>;
};

const ScholarshipFinder: React.FC<ScholarshipFinderProps> = ({ 
  allScholarships, 
  wrappedScholarships,
  userProfile, 
  isLoading: parentLoading, 
  userName,
  applications,
  onApply
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('matched');
  const [showWrapped, setShowWrapped] = useState(false);
  const [dbScholarships, setDbScholarships] = useState<ScholarshipWithTracks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfileFromDB, setUserProfileFromDB] = useState<UserProfileFromDB | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user and profile
  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        setCurrentUser(user);
        
        // Fetch user profile from database
        const profileRes = await databases.listDocuments(DB_ID, USER_PROFILE_COL_ID, [
          Query.equal('uid', user.$id),
          Query.limit(1)
        ]);
        
        if (profileRes.documents.length > 0) {
          setUserProfileFromDB(profileRes.documents[0] as unknown as UserProfileFromDB);
        }
      } catch (e) {
        // User not logged in
      }
    };
    init();
  }, []);

  // Check if a track matches user profile
  const checkTrackMatch = (track: any, profile: UserProfileFromDB | null): boolean => {
    if (!profile) return true; // Show all if no profile

    // Level check
    if (track.allowed_levels?.length > 0 && !track.allowed_levels.includes(profile.level)) {
      return false;
    }

    // CGPA check
    if (track.min_cgpa > 0 && profile.cgpa < track.min_cgpa) {
      return false;
    }

    // JAMB score check
    if (track.min_jamb_score > 0 && profile.jamb < track.min_jamb_score) {
      return false;
    }

    // Gender check
    if (track.required_gender && track.required_gender !== 'ANY' && track.required_gender !== profile.gender) {
      return false;
    }

    // State of origin check
    if (track.required_state_of_origin?.length > 0 && 
        !track.required_state_of_origin.includes('ALL') &&
        !track.required_state_of_origin.includes(profile.state)) {
      return false;
    }

    // LGA check
    if (track.required_lga_list?.length > 0 && 
        !track.required_lga_list.includes(profile.lga)) {
      return false;
    }

    // University check
    if (track.required_universities?.length > 0 && 
        !track.required_universities.includes('ALL') &&
        !track.required_universities.includes(profile.uni)) {
      return false;
    }

    // Course category check
    if (track.course_category?.length > 0 && 
        !track.course_category.includes('ALL') &&
        !track.course_category.includes(profile.course)) {
      return false;
    }

    // Religion check
    if (track.required_religion && track.required_religion !== 'NONE' && track.required_religion !== profile.rel) {
      return false;
    }

    // Financial need check
    if (track.is_financial_need_required && !profile.finance) {
      return false;
    }

    // Orphan/single parent check
    if (track.is_orphan_or_single_parent_required && !profile.orphan) {
      return false;
    }

    // Disability check
    if (track.is_disability_specific && !profile.chal) {
      return false;
    }

    return true;
  };

  // Fetch active scholarships from database
  useEffect(() => {
    const fetchActiveScholarships = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
          Query.equal('is_active', true),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]);

        // Transform database format to Scholarship type
        const transformed: ScholarshipWithTracks[] = await Promise.all(
          response.documents.map(async (doc: any) => {
            // Fetch tracks for this scholarship
            const tracksRes = await databases.listDocuments(DB_ID, TRACKS_COL_ID, [
              Query.equal('scholarship_id', doc.$id),
              Query.limit(10)
            ]);

            const tracks = tracksRes.documents;
            
            // Build eligibility array from first track
            const eligibility: string[] = [];
            if (tracks.length > 0) {
              const track = tracks[0] as any;
              
              if (track.min_cgpa > 0) eligibility.push(`Min CGPA: ${track.min_cgpa}`);
              if (track.min_jamb_score > 0) eligibility.push(`Min JAMB: ${track.min_jamb_score}`);
              if (track.required_gender && track.required_gender !== 'ANY') {
                eligibility.push(`Gender: ${track.required_gender}`);
              }
              if (track.required_state_of_origin?.length > 0 && !track.required_state_of_origin.includes('ALL')) {
                eligibility.push(`States: ${track.required_state_of_origin.slice(0, 3).join(', ')}`);
              }
              if (track.required_universities?.length > 0 && !track.required_universities.includes('ALL')) {
                eligibility.push(`Universities: ${track.required_universities.slice(0, 3).join(', ')}`);
              }
              if (track.course_category?.length > 0 && !track.course_category.includes('ALL')) {
                eligibility.push(`Courses: ${track.course_category.join(', ')}`);
              }
              if (track.specific_requirements?.length > 0) {
                eligibility.push(...track.specific_requirements.slice(0, 2));
              }
            }

            return {
              id: doc.$id,
              name: doc.scholarship_name,
              provider: doc.provider,
              description: `Scholarship opportunity by ${doc.provider}`,
              eligibility: eligibility.length > 0 ? eligibility : ['Check official link for requirements'],
              rewardAmount: doc.award_amount || 'Tuition Support',
              deadline: doc.deadline === 'Not Specified' ? 'Open Deadline' : doc.deadline,
              link: doc.official_link,
              status: 'open',
              modeOfSelection: tracks.length > 0 && (tracks[0] as any).is_aptitude_test_required 
                ? 'Aptitude Test Required' 
                : 'No Test Required',
              tracks: tracks // Store tracks for filtering
            } as ScholarshipWithTracks;
          })
        );

        setDbScholarships(transformed);
      } catch (error) {
        // Error fetching scholarships
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveScholarships();
  }, []);

  // Confetti effect when modal opens
  useEffect(() => {
    if (showWrapped) {
      // Simple confetti animation using emojis
      const confettiCount = 50;
      const confettiElements: HTMLDivElement[] = [];
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.textContent = ['🎉', '🎊', '✨', '🌟', '💰'][Math.floor(Math.random() * 10)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-50px';
        confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        confettiElements.push(confetti);
      }
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Cleanup after animation
      setTimeout(() => {
        confettiElements.forEach(el => el.remove());
        style.remove();
      }, 5000);
    }
  }, [showWrapped]);



  const filteredScholarships = useMemo(() => {
    // Get IDs of applied scholarships
    const appliedIds = new Set(applications.map(a => a.scholarshipId));
    
    if (activeFilter === 'matched') {
      // Filter scholarships that match user profile AND are not applied
      // If no profile, show all scholarships
      if (!userProfileFromDB) {
        return dbScholarships
          .filter(s => !appliedIds.has(s.id))
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      
      return dbScholarships.filter(scholarship => {
        // Exclude already applied scholarships
        if (appliedIds.has(scholarship.id)) return false;
        
        // Check if any track matches
        const hasMatchingTrack = scholarship.tracks?.some(track => 
          checkTrackMatch(track, userProfileFromDB)
        );
        
        return hasMatchingTrack;
      }).sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeFilter === 'applied') {
      // Show applied scholarships
      return dbScholarships
        .filter(s => appliedIds.has(s.id))
        .sort((a, b) => {
          // Sort by application date (most recent first)
          const appA = applications.find(app => app.scholarshipId === a.id);
          const appB = applications.find(app => app.scholarshipId === b.id);
          return new Date(appB?.appliedAt || 0).getTime() - new Date(appA?.appliedAt || 0).getTime();
        });
    }
    
    return [];
  }, [dbScholarships, activeFilter, userProfileFromDB, applications]);

  const wrappedStats = useMemo(() => {
    let totalValue = 0;
    let parsedCount = 0;
    
    wrappedScholarships.forEach((s, index) => {
        const amountStr = s.rewardAmount;
        
        // Skip "Tuition support" or non-numeric strings
        if (!amountStr || amountStr.toLowerCase().includes('tuition') || amountStr.toLowerCase().includes('support')) {
            return;
        }
        
        // Remove commas before parsing to handle formatted numbers like "200,000"
        const cleanedStr = amountStr.replace(/,/g, '');
        const allNumbers = cleanedStr.match(/\d+/g);
        
        if (allNumbers && allNumbers.length >= 2 && cleanedStr.includes('-')) {
            // It's a range (e.g., "NGN150000 - NGN200000" gives ["150000", "200000"])
            const min = parseFloat(allNumbers[0]);
            const max = parseFloat(allNumbers[1]);
            const avg = (min + max) / 2;
            totalValue += avg;
            parsedCount++;
            return; // Exit early
        }
        
        // Single value: join all numbers (in case there were commas) or use first
        if (allNumbers && allNumbers.length > 0) {
            const val = parseFloat(allNumbers.join(''));
            if (!isNaN(val) && val > 0) {
                totalValue += val;
                parsedCount++;
                return;
            }
        }
    });

    return {
        count: wrappedScholarships.length,
        totalValue: totalValue,
        formattedValue: totalValue > 0 ? totalValue.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) : 'Varied Support'
    };
  }, [wrappedScholarships]);

  // Identify Top Matches (from wrapped scholarships)
  const topMatches = useMemo(() => {
    const bigNames = ['Shell', 'MTN', 'NNPC', 'KPMG', 'NLNG', 'Chevron', 'Total', 'Exxon', 'Seplat'];
    return wrappedScholarships.filter(s => 
      bigNames.some(name => s.provider.toLowerCase().includes(name.toLowerCase()))
    );
  }, [wrappedScholarships]);

  const getButtonClasses = (status: FilterStatus) => {
    const base = "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    if (activeFilter === status) {
        return `${base} bg-blue-600 text-white shadow focus:ring-blue-500`;
    }
    return `${base} bg-white text-gray-600 hover:bg-gray-100 focus:ring-blue-400`;
  };

  if (isLoading || parentLoading) {
    return (
      <div className="text-center text-gray-500 p-8">
        <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-lg font-semibold mt-4">Finding your matches...</h3>
        <p className="mt-1">Cross-referencing your profile and checking for live updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Wrapped Report Banner */}
      <div 
        onClick={() => setShowWrapped(true)}
        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      >
        <h2 className="text-2xl font-bold">View Your 2025 Wrapped Report!</h2>
        <p className="text-blue-100 text-sm mt-1">Click to see your scholarship summary</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button 
          className={getButtonClasses('matched')} 
          onClick={() => setActiveFilter('matched')}
        >
          {userProfileFromDB ? 'My Matches' : 'All Active'}
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-blue-100 bg-blue-800 rounded-full">
            {userProfileFromDB 
              ? dbScholarships.filter(s => 
                  !applications.some(a => a.scholarshipId === s.id) && 
                  s.tracks?.some(t => checkTrackMatch(t, userProfileFromDB))
                ).length
              : dbScholarships.filter(s => !applications.some(a => a.scholarshipId === s.id)).length
            }
          </span>
        </button>
        
        <button 
          className={getButtonClasses('applied')} 
          onClick={() => setActiveFilter('applied')}
        >
          Applied
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-green-100 bg-green-700 rounded-full">
            {applications.length}
          </span>
        </button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredScholarships.length}</span> scholarship{filteredScholarships.length !== 1 ? 's' : ''}
      </div>

      {/* Scholarship List */}
      <div className="space-y-4">
        {filteredScholarships.length > 0 ? (
          filteredScholarships.map((scholarship) => {
            // Check if user has applied to this scholarship
            const isApplied = applications.some(a => a.scholarshipId === scholarship.id);
            const applicationInfo = applications.find(a => a.scholarshipId === scholarship.id);
            
            return (
              <div key={scholarship.id}>
                {/* Show application info for applied scholarships */}
                {activeFilter === 'applied' && applicationInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-t-lg px-4 py-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">
                        <strong>Applied:</strong> {new Date(applicationInfo.appliedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="text-gray-600">
                        <strong>Deadline:</strong> {applicationInfo.deadline}
                      </span>
                    </div>
                  </div>
                )}
                <ScholarshipCard 
                  scholarship={scholarship}
                  isMatched={true}
                  onApply={onApply}
                  isApplied={isApplied}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 bg-yellow-50 p-8 rounded-lg">
            <SearchIcon className="mx-auto h-12 w-12 text-yellow-400" />
            <h3 className="text-lg font-semibold mt-4">
              {activeFilter === 'applied' ? 'No Applications Yet' : 'No Scholarships Found'}
            </h3>
            <p className="mt-1">
              {activeFilter === 'applied' 
                ? 'Click "I Have Applied" on scholarships you\'ve applied to track them here.'
                : 'Check back soon for new opportunities.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Wrapped Report Modal */}
      {showWrapped && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">2025 Wrapped</h2>
                <p className="text-blue-100 text-sm">Your Scholarship Year in Review</p>
              </div>
              <button 
                onClick={() => setShowWrapped(false)}
                className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 bg-gradient-to-b from-blue-50 to-white flex flex-col items-center text-center space-y-8 overflow-y-auto">
                
                {/* Stats Card */}
                <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-blue-100 transform hover:scale-105 transition-transform duration-300">
                    <div className="mb-4">
                        <span className="text-5xl font-extrabold text-blue-600 block">
                          <AnimatedCounter value={wrappedStats.count} />
                        </span>
                        <span className="text-gray-500 font-medium uppercase tracking-wide text-xs">Scholarships Matched</span>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full my-4"></div>
                    
                    <div>
                        <span className="text-gray-500 font-medium uppercase tracking-wide text-xs block mb-1">Total Potential Value</span>
                        <span className="text-3xl font-bold text-green-600 block">
                           ₦<AnimatedCounter value={wrappedStats.totalValue} />
                        </span>
                    </div>
                </div>

                {/* Top Matches Highlight */}
                {topMatches.length > 0 && (
                  <div className="w-full text-left">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">🔥 You Matched With Top Providers</h3>
                    
                    {/* Provider Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {topMatches.slice(0, 5).map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                          {s.provider.split(' ')[0]}
                        </span>
                      ))}
                      {topMatches.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          +{topMatches.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Top 5 Scholarship Links */}
                    <div className="space-y-2 mt-4">
                      {topMatches.slice(0, 5).map((s, i) => (
                        <a
                          key={i}
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
                                {s.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {s.provider} • {s.rewardAmount}
                              </p>
                            </div>
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                    <p>Based on your profile eligibility for the 2024/2025 cycle.</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipFinder;