import React from 'react';

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
  return (
    <section id="features" className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
