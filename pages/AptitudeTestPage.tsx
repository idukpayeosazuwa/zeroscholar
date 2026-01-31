import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TestCategory {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

const AptitudeTestPage: React.FC = () => {
  const navigate = useNavigate();

  const categories: TestCategory[] = [
    {
      id: 'numerical',
      name: 'Numerical Reasoning',
      description: 'Practice data interpretation, charts, and mathematical problem-solving',
      questionCount: 10,
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      id: 'verbal',
      name: 'Verbal Reasoning',
      description: 'Test your comprehension, vocabulary, and logical thinking',
      questionCount: 75,
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      id: 'abstract',
      name: 'Abstract Reasoning',
      description: 'Practice pattern recognition and spatial awareness',
      questionCount: 0,
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      available: false
    }
  ];

  const handleCategoryClick = (category: TestCategory) => {
    if (!category.available) return;
    
    console.log('🔍 Navigating to category:', category.id);
    
    if (category.id === 'numerical') {
      navigate('/app/test/numerical');
    } else if (category.id === 'verbal') {
      console.log('📍 Navigating to /app/test/verbal');
      navigate('/app/test/verbal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/tools')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tools
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Aptitude Test Arena</h1>
          <p className="text-gray-600 mt-2">
            Prepare for scholarship aptitude tests with practice questions
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
              <p className="text-sm text-blue-800">
                Select a category below to start practicing. Answer questions at your own pace and get instant feedback with detailed explanations.
              </p>
            </div>
          </div>
        </div>

        {/* Test Categories */}
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              disabled={!category.available}
              className={`text-left bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${
                category.available
                  ? 'hover:shadow-xl hover:scale-105 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`bg-gradient-to-r ${category.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  {category.icon}
                  {category.available && (
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                      {category.questionCount} Questions
                    </span>
                  )}
                  {!category.available && (
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                {category.available && (
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold">
                    Start Practice
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Stats Section (Placeholder) */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Tests Taken</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600 mt-1">Avg Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Questions Answered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTestPage;
