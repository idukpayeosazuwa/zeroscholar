import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'AI-Powered Matching',
    description: 'Our advanced AI analyzes your profile against 181 verified scholarships to find your perfect matches.',
    icon: '🤖'
  },

  {
    title: 'Application Tracking',
    description: 'Keep track of where you\'ve applied and monitor your progress all in one place.',
    icon: '📊'
  },
  {
    title: 'Aptitude Test Prep',
    description: 'Practice with our comprehensive test arena to ace scholarship aptitude exams.',
    icon: '✏️'
  },

];

export default function Features() {
  const navigate = useNavigate();
  
  return (
    <section id="features" className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Free Tool Highlight */}
        <div className="mb-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-4">FREE TOOL</span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">CGPA Calculator</h3>
              <p className="text-white/90 max-w-md">
                Calculate your GPA instantly - no sign up required! Track courses by semester, level, or cumulative. 
                Works offline too!
              </p>
            </div>
            <button
              onClick={() => navigate('/tools/cgpa-calculator')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors whitespace-nowrap shadow-lg"
            >
              Try It Now →
            </button>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2240AF] mb-4">Why Choose ScholarAI?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by 181 verified scholarships and trained on real 2025 data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#2240AF]">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-[#2240AF] mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
