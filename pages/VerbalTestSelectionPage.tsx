import React from 'react';
import { useNavigate } from 'react-router-dom';

interface VerbalTest {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

const VerbalTestSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const tests: VerbalTest[] = [
    {
      id: 'test1',
      name: 'Verbal Reasoning Test 1',
      description: 'Practice with passages on dinosaurs, feral cats, economics, and more',
      questionCount: 11
    },
    {
      id: 'test2',
      name: 'Verbal Reasoning Test 2',
      description: 'Practice with passages on work stress, cancer treatment, technology, and workplace bullying',
      questionCount: 14
    },
    {
      id: 'test3',
      name: 'Verbal Reasoning Test 3',
      description: 'Practice with passages on entrepreneurship, employee-boss relationships, salespeople, and business ethics',
      questionCount: 13
    },
    {
      id: 'test4',
      name: 'Verbal Reasoning Test 4',
      description: 'Practice with passages on advertising strategies, open-source software, and the Ring of Fire',
      questionCount: 12
    },
    {
      id: 'test5',
      name: 'Verbal Reasoning Test 5',
      description: 'Practice with passages on Dead Sea Scrolls, Bilderberg Group, and net neutrality',
      questionCount: 13
    },
    {
      id: 'test6',
      name: 'Verbal Reasoning Test 6',
      description: 'Practice with passages on irredentism, global water crisis, and Esperanto',
      questionCount: 12
    }
  ];

  const handleTestClick = (testId: string) => {
    navigate(`/app/test/verbal/${testId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/tools/aptitude')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Aptitude Tests
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verbal Reasoning Tests
          </h1>
          <p className="text-gray-600">
            Select a test to practice your verbal reasoning skills. Read passages carefully and determine if statements are True, False, or Cannot Say.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">How it works</h3>
              <p className="text-sm text-green-800">
                Each test contains multiple passages with questions. Answer at your own pace and get instant feedback with detailed explanations.
              </p>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => handleTestClick(test.id)}
              className="text-left bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                    {test.questionCount} Questions
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{test.name}</h3>
                <p className="text-gray-600 text-sm">{test.description}</p>
                <div className="mt-4 flex items-center text-green-600 text-sm font-semibold">
                  Start Test
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Test Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Read the passage carefully before looking at the statement</li>
            <li>Only use information explicitly stated in the passage</li>
            <li>"Cannot Say" means the passage doesn't provide enough information</li>
            <li>Don't rely on external knowledge or assumptions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerbalTestSelectionPage;
