import React, { useState, useEffect } from 'react';
import { Models, Query } from 'appwrite';
import { databases, account } from '../appwriteConfig';
import { CalendarIcon } from './icons/CalendarIcon';
import { LinkIcon } from './icons/LinkIcon';

const DB_ID = 'scholarship_db';
const SCHOLARSHIP_COL_ID = 'scholarships';
const TRACKS_COL_ID = 'eligibility_tracks';
const USER_PROFILE_COL_ID = 'user_profiles'; // Adjust if different

interface ScholarshipDoc {
  $id: string;
  scholarship_name: string;
  provider: string;
  deadline: string;
  award_amount: string;
  official_link: string;
  is_active: boolean;
}

interface TrackDoc {
  $id: string;
  scholarship_id: string;
  track_name: string;
  allowed_levels: number[];
  min_cgpa: number;
  min_jamb_score: number;
  required_gender: string;
  is_financial_need_required: boolean;
  is_orphan_or_single_parent_required: boolean;
  required_religion: string;
  is_disability_specific: boolean;
  is_aptitude_test_required: boolean;
  required_state_of_origin: string[];
  required_lga_list: string[];
  required_universities: string[];
  course_category: string[];
  specific_requirements: string[];
}

interface UserProfile {
  $id: string;
  user_id: string;
  level: number;
  cgpa: number;
  jamb_score: number;
  gender: string;
  state_of_origin: string;
  lga: string;
  university: string;
  course_category: string;
  has_financial_need: boolean;
  is_orphan_or_single_parent: boolean;
  religion: string;
  has_disability: boolean;
}

interface MatchedScholarship extends ScholarshipDoc {
  matchingTracks: TrackDoc[];
}

const ScholarshipList: React.FC = () => {
  const [scholarships, setScholarships] = useState<MatchedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<MatchedScholarship | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        
        // Fetch user profile
        const profileRes = await databases.listDocuments(DB_ID, USER_PROFILE_COL_ID, [
          Query.equal('user_id', currentUser.$id),
          Query.limit(1)
        ]);
        
        if (profileRes.documents.length > 0) {
          setUserProfile(profileRes.documents[0] as unknown as UserProfile);
        }
      } catch (e) {
        setUser(null);
      }
    };
    init();
  }, []);

  useEffect(() => {
    fetchAndMatchScholarships();
  }, [userProfile]);

  const checkTrackMatch = (track: TrackDoc, profile: UserProfile | null): boolean => {
    // If no profile, show all active scholarships
    if (!profile) return true;

    // Level check
    if (track.allowed_levels?.length > 0 && !track.allowed_levels.includes(profile.level)) {
      return false;
    }

    // CGPA check - SKIP for 100 Level students (they don't have CGPA yet)
    const isUser100Level = profile.level === 100 || String(profile.level).includes('100');
    if (!isUser100Level && track.min_cgpa > 0 && profile.cgpa < track.min_cgpa) {
      return false;
    }

    // JAMB score check
    if (track.min_jamb_score > 0 && profile.jamb_score < track.min_jamb_score) {
      return false;
    }

    // Gender check
    if (track.required_gender && track.required_gender !== 'ANY' && track.required_gender !== profile.gender) {
      return false;
    }

    // State of origin check
    if (track.required_state_of_origin?.length > 0 && 
        !track.required_state_of_origin.includes('ALL') &&
        !track.required_state_of_origin.includes(profile.state_of_origin)) {
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
        !track.required_universities.includes(profile.university)) {
      return false;
    }

    // Course category check
    if (track.course_category?.length > 0 && 
        !track.course_category.includes('ALL') &&
        !track.course_category.includes(profile.course_category)) {
      return false;
    }

    // Religion check
    if (track.required_religion && track.required_religion !== 'NONE' && track.required_religion !== profile.religion) {
      return false;
    }

    // Financial need check
    if (track.is_financial_need_required && !profile.has_financial_need) {
      return false;
    }

    // Orphan/single parent check
    if (track.is_orphan_or_single_parent_required && !profile.is_orphan_or_single_parent) {
      return false;
    }

    // Disability check
    if (track.is_disability_specific && !profile.has_disability) {
      return false;
    }

    return true;
  };

  const fetchAndMatchScholarships = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all active scholarships
      const scholarshipRes = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
        Query.equal('is_active', true),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]);

      const activeScholarships = scholarshipRes.documents as unknown as ScholarshipDoc[];

      if (activeScholarships.length === 0) {
        setScholarships([]);
        setLoading(false);
        return;
      }

      // Fetch all tracks for active scholarships
      const scholarshipIds = activeScholarships.map(s => s.$id);
      const tracksRes = await databases.listDocuments(DB_ID, TRACKS_COL_ID, [
        Query.equal('scholarship_id', scholarshipIds),
        Query.limit(500)
      ]);

      const allTracks = tracksRes.documents as unknown as TrackDoc[];

      // Match scholarships with user profile
      const matched: MatchedScholarship[] = [];

      for (const scholarship of activeScholarships) {
        const scholarshipTracks = allTracks.filter(t => t.scholarship_id === scholarship.$id);
        
        // Find matching tracks for this scholarship
        const matchingTracks = scholarshipTracks.filter(track => checkTrackMatch(track, userProfile));

        // If at least one track matches, include the scholarship
        if (matchingTracks.length > 0 || scholarshipTracks.length === 0) {
          matched.push({
            ...scholarship,
            matchingTracks: matchingTracks.length > 0 ? matchingTracks : scholarshipTracks
          });
        }
      }

      setScholarships(matched);
    } catch (err: any) {
      console.error('Error fetching scholarships:', err);
      setError(err.message || 'Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-gray-600">Loading scholarships...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading scholarships</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchAndMatchScholarships}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No matching scholarships found.</p>
        {!userProfile && (
          <p className="text-sm text-gray-500 mt-2">
            Complete your profile to see personalized scholarship matches.
          </p>
        )}
      </div>
    );
  }

  const handleApplyClick = (scholarship: MatchedScholarship) => {
    if (scholarship.official_link && scholarship.official_link.toLowerCase() !== 'none') {
      window.open(scholarship.official_link, '_blank');
    } else {
      setSelectedScholarship(scholarship);
      setShowModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {userProfile ? 'Scholarships For You' : 'Active Scholarships'}
        </h2>
        <span className="text-sm text-gray-500">
          {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((scholarship) => (
          <div 
            key={scholarship.$id}
            className="relative bg-white shadow-lg rounded-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
          >
            {/* Award Badge */}
            <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 text-sm font-bold">
              {scholarship.award_amount || 'Tuition Support'}
            </div>

            {/* Active Badge */}
            <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
              Active
            </div>

            <div className="px-5 pb-5 pt-12">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                {scholarship.scholarship_name}
              </h3>
              
              <p className="text-sm text-gray-500 mt-1">
                by {scholarship.provider}
              </p>

              {/* Matching Tracks Info */}
              {userProfile && scholarship.matchingTracks.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-green-600 font-medium">
                    ✓ You qualify for {scholarship.matchingTracks.length} track{scholarship.matchingTracks.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scholarship.matchingTracks.slice(0, 2).map((track, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700"
                      >
                        {track.track_name}
                      </span>
                    ))}
                    {scholarship.matchingTracks.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{scholarship.matchingTracks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements Preview */}
              {scholarship.matchingTracks[0]?.specific_requirements?.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase">Key Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-0.5">
                    {scholarship.matchingTracks[0].specific_requirements.slice(0, 2).map((req, idx) => (
                      <li key={idx} className="truncate">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-3 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarIcon className="h-5 w-5 text-red-500" />
                <span className="font-medium text-gray-700">
                  {scholarship.deadline === 'Not Specified' ? 'Open Deadline' : scholarship.deadline}
                </span>
              </div>

              {scholarship.official_link && (
                <button
                  onClick={() => handleApplyClick(scholarship)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Now
                  <LinkIcon className="ml-2 h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Requirements Modal */}
      {showModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Application Requirements
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {selectedScholarship.scholarship_name}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Provided by {selectedScholarship.provider}
              </p>

              {selectedScholarship.matchingTracks.length > 0 && selectedScholarship.matchingTracks[0].specific_requirements?.length > 0 ? (
                <div>
                  <h5 className="text-md font-semibold text-gray-700 mb-3">Requirements:</h5>
                  <ul className="space-y-2">
                    {selectedScholarship.matchingTracks[0].specific_requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{req.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    No specific requirements listed. Please contact {selectedScholarship.provider} directly for application details.
                  </p>
                </div>
              )}

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-700">
                  <strong>Deadline:</strong> {selectedScholarship.deadline}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Award:</strong> {selectedScholarship.award_amount || 'Tuition Support'}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipList;
