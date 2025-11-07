import React, { useState, useMemo } from 'react';
import { Scholarship } from '../types';
import ScholarshipCard from './ScholarshipCard';
import { SearchIcon } from './icons/SearchIcon';

type FilterStatus = 'open' | 'upcoming' | 'closed';

interface ScholarshipFinderProps {
  scholarships: Scholarship[];
  isLoading: boolean;
  userName: string;
}

const ScholarshipFinder: React.FC<ScholarshipFinderProps> = ({ scholarships, isLoading, userName }) => {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('open');

  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => s.status?.toLowerCase() === activeFilter);
  }, [scholarships, activeFilter]);

  const getButtonClasses = (status: FilterStatus) => {
    const base = "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    if (activeFilter === status) {
        return `${base} bg-blue-600 text-white shadow focus:ring-blue-500`;
    }
    return `${base} bg-white text-gray-600 hover:bg-gray-100 focus:ring-blue-400`;
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 p-8">
        <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-lg font-semibold mt-4">Finding your matches...</h3>
        <p className="mt-1">Cross-referencing your profile and checking for live updates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mb-6">
            <h2 className="font-bold">Welcome, {userName.split(' ')[0]}!</h2>
            <p>Here are the scholarships that match your profile. We've checked for the latest deadlines.</p>
        </div>

      <div className="mb-6 flex justify-center space-x-2 bg-gray-200 p-1 rounded-full">
        <button className={getButtonClasses('open')} onClick={() => setActiveFilter('open')}>Open</button>
        <button className={getButtonClasses('upcoming')} onClick={() => setActiveFilter('upcoming')}>Upcoming</button>
        <button className={getButtonClasses('closed')} onClick={() => setActiveFilter('closed')}>Closed</button>
      </div>
      
      <div className="space-y-4">
        {filteredScholarships.length > 0 ? (
          filteredScholarships.map((scholarship, index) => (
            <ScholarshipCard key={`${scholarship.name}-${index}`} scholarship={scholarship} />
          ))
        ) : (
          <div className="text-center text-gray-500 bg-yellow-50 p-8 rounded-lg">
            <SearchIcon className="mx-auto h-12 w-12 text-yellow-400" />
            <h3 className="text-lg font-semibold mt-4">No Matches Found Yet</h3>
            <p className="mt-1">We couldn't find any {activeFilter} scholarships matching your current profile. Try adjusting your profile details!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipFinder;