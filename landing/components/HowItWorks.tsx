import React from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    number: '1',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your academic level, field of study, location, and CGPA.'
  },
  {
    number: '2',
    title: 'AI Analyzes Your Match',
    description: 'Our AI instantly compares your profile against 181 verified scholarships from 2025.'
  },
  {
    number: '3',
    title: 'Get Personalized Matches',
    description: 'Receive a curated list of scholarships tailored specifically to you, ranked by relevance.'
  },
  {
    number: '4',
    title: 'Apply & Track Progress',
    description: 'Click to apply directly, track deadlines, and manage all your applications in one dashboard.'
  }
];

export default function HowItWorks() {
  const navigate = useNavigate();

  const handleGetWrapped = () => {
    navigate('/login');
  };

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2240AF] mb-4">How ScholarAI Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to find your perfect scholarship
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#2240AF] to-[#5B85AA]" 
                  style={{ width: 'calc(100% + 1.5rem)', marginLeft: '1.5rem' }}></div>
              )}

              <div className="relative bg-gradient-to-br from-[#2240AF] to-[#414770] rounded-lg p-8 text-white">
                <div className="w-12 h-12 bg-yellow-300 text-[#2240AF] rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/90">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2025 Wrapped Section */}
        <div className="mt-16 bg-gradient-to-r from-[#2240AF]/10 to-[#5B85AA]/10 rounded-lg p-8 border border-[#2240AF]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-[#2240AF] mb-3">Your 2025 Wrapped</h3>
              <p className="text-gray-700 mb-4">
                Discover the scholarships you were eligible for in 2025 but missed. Sign in to get your personalized report:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center"><span className="text-[#2240AF] mr-2">•</span> Total eligible scholarships</li>
                <li className="flex items-center"><span className="text-[#2240AF] mr-2">•</span> Total potential value missed</li>
                <li className="flex items-center"><span className="text-[#2240AF] mr-2">•</span> Breakdown by field of study</li>
                <li className="flex items-center"><span className="text-[#2240AF] mr-2">•</span> Top 5 opportunities you missed</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={handleGetWrapped}
                className="px-8 py-4 bg-[#2240AF] text-white font-bold rounded-lg hover:bg-[#1a2e7f] transition-colors shadow-lg"
              >
                View Your 2025 Wrapped
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
