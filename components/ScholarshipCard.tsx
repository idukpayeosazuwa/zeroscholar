import React, { useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { Scholarship, Application } from '../types';
import { formatDate } from '../lib/utils/dateFormatter';
import { CalendarIcon } from './icons/CalendarIcon';
import { LinkIcon } from './icons/LinkIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { BellIcon } from './icons/BellIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { account } from '../appwriteConfig';
// import { subscribeToScholarship, checkSubscription } from '../services/notificationService';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isMatched?: boolean; // New prop to indicate if it matches user profile
  onApply?: (application: Application) => void; // Callback when user marks as applied
  isApplied?: boolean; // Whether user has already applied
}

type NotificationStatus = 'idle' | 'loading' | 'subscribed' | 'denied';

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship, isMatched = true, onApply, isApplied = false }) => {
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('idle');
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
        } catch (e) {
            setUser(null);
        }
    };
    getCurrentUser();
  }, []);

  const mode = scholarship.modeOfSelection?.toLowerCase() || '';
  const requiresTest = mode.includes('aptitude test') && !mode.includes('not');
  const noTestRequired = mode.includes('not required');
  const isActionable = scholarship.status?.toLowerCase() === 'closed' || scholarship.status?.toLowerCase() === 'upcoming';

  const handleApplyClick = async () => {
    if (!onApply || isApplied) return;
    setApplyLoading(true);
    
    const application: Application = {
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      appliedAt: new Date().toISOString(),
      deadline: scholarship.deadline
    };
    
    try {
      await onApply(application);
    } finally {
      setApplyLoading(false);
    }
  };

  // useEffect(() => {
  //   // Only check subscription for actionable scholarships and if a user is logged in
  //   if (isActionable && user) {
  //     const checkCurrentSubscription = async () => {
  //       const isSubscribed = await checkSubscription(user.$id, scholarship.id);
  //       if (isSubscribed) {
  //         setNotificationStatus('subscribed');
  //       }
  //     };
  //     checkCurrentSubscription();
  //   }
  // }, [scholarship.id, user, isActionable]);


  // const handleNotifyClick = async () => {
  //   if (!user) return;
  //   setNotificationStatus('loading');
  //   const success = await subscribeToScholarship(user.$id, scholarship.id, scholarship.name);
  //   if (success) {
  //     setNotificationStatus('subscribed');
  //   } else {
  //     // This could be because permission was denied or an error occurred
  //     setNotificationStatus(Notification.permission === 'denied' ? 'denied' : 'idle');
  //   }
  // };

  const renderNotificationButton = () => {
    if (!isActionable) return null;

    switch (notificationStatus) {
      case 'loading':
        return (
          <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-gray-500 bg-gray-100">
             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Subscribing...
          </span>
        );
      case 'subscribed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-green-700 bg-green-100">
            <CheckCircleIcon className="mr-1.5 h-4 w-4" />
            Notification Set
          </span>
        );
      case 'denied':
         return (
          <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-red-700 bg-red-100">
            <XCircleIcon className="mr-1.5 h-4 w-4" />
            Notifications Blocked
          </span>
        );
      case 'idle':
      default:
        return (
          <button
        
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <BellIcon className="mr-1.5 h-4 w-4" />
            Notify Me When Open
          </button>
        );
    }
  };

  return (
    <div className="relative bg-white shadow-lg rounded-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 text-sm font-bold">
        {scholarship.rewardAmount}
      </div>

      {/* Match indicator badge */}
      {!isMatched && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          ⚠️ Check Eligibility
        </div>
      )}

      <div className="px-5 pb-5 pt-10">
        <div>
            <h3 className="text-xl font-bold text-gray-900">{scholarship.name}</h3>
            
            {(requiresTest || noTestRequired) && (
              <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                requiresTest ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 mr-1.5" />
                {requiresTest ? 'Aptitude Test Required' : 'No Test Required'}
              </span>
            )}
        </div>
        
        <p className="text-gray-600 mt-3">{scholarship.description}</p>
        
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Key Eligibility:</h4>
            <ul className="list-none text-gray-600 space-y-2">
                {scholarship.eligibility.slice(0, 3).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-sm leading-relaxed break-words">{item}</span>
                  </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-2 text-sm">
            <CalendarIcon className="h-5 w-5 text-red-500" />
            <span className="font-medium text-gray-700">Deadline: {formatDate(scholarship.deadline, 'medium')}</span>
        </div>
        
        {renderNotificationButton()}

        <div className="flex items-center gap-2">
          {/* I Have Applied Button */}
          {onApply && !isApplied && scholarship.status?.toLowerCase() === 'open' && (
            <button
              onClick={handleApplyClick}
              disabled={applyLoading}
              className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md shadow-sm text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {applyLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                  I Have Applied
                </>
              )}
            </button>
          )}
          
          {isApplied && (
            <span className="inline-flex items-center px-3 py-2 border border-green-200 text-sm font-medium rounded-md text-green-700 bg-green-100">
              <CheckCircleIcon className="mr-1.5 h-4 w-4" />
              Applied
            </span>
          )}

          {scholarship.link && scholarship.link.toLowerCase() !== 'none' && scholarship.status?.toLowerCase() === 'open' ? (
              <a 
                href={scholarship.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Now
                <LinkIcon className="ml-2 h-4 w-4" />
              </a>
          ) : scholarship.status?.toLowerCase() !== 'open' ? null : (
              <span className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                  Link Unavailable
              </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipCard;