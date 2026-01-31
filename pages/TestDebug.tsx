import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TestDebug: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('🐛 TestDebug page loaded!', location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Test Route Working!
        </h1>
        <p className="text-gray-700 mb-4">
          Current path: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
        </p>
        <button
          onClick={() => navigate('/app/tools/aptitude')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Back to Aptitude Tests
        </button>
      </div>
    </div>
  );
};

export default TestDebug;
