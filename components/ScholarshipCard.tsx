
import React from 'react';
import { Scholarship } from '../types';
import { AwardIcon } from './icons/AwardIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { LinkIcon } from './icons/LinkIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship }) => {
  const mode = scholarship.modeOfSelection?.toLowerCase() || '';
  const requiresTest = mode.includes('aptitude test') && !mode.includes('not');
  const noTestRequired = mode.includes('not required');

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold text-blue-600 uppercase">{scholarship.provider}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{scholarship.name}</h3>
                
                {(requiresTest || noTestRequired) && (
                  <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    requiresTest ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 mr-1.5" />
                    {requiresTest ? 'Aptitude Test Required' : 'No Test Required'}
                  </span>
                )}
            </div>
            <AwardIcon className="h-8 w-8 text-yellow-500 flex-shrink-0"/>
        </div>
        
        <p className="text-gray-600 mt-3">{scholarship.description}</p>
        
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700">Key Eligibility:</h4>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                {scholarship.eligibility.slice(0, 3).map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-2 text-sm">
            <CalendarIcon className="h-5 w-5 text-red-500" />
            <span className="font-medium text-gray-700">Deadline: {scholarship.deadline}</span>
        </div>
        <div className="text-sm font-bold text-green-600">
            {scholarship.rewardAmount}
        </div>
        {scholarship.link ? (
            <a 
              href={scholarship.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Now
              <LinkIcon className="ml-2 h-4 w-4" />
            </a>
        ) : (
            <span className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                Apply Link Unavailable
            </span>
        )}
      </div>
    </div>
  );
};

export default ScholarshipCard;