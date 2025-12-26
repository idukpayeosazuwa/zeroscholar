import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from './icons/LogoIcon';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  isAvailable: boolean;
}

const ToolsPage: React.FC = () => {
  const navigate = useNavigate();

  const tools: Tool[] = [
    {
      id: 'cgpa',
      name: 'CGPA Calculator',
      description: 'Calculate your cumulative GPA by semester, level, or overall',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3v3m-6-1v-7a2 2 0 012-2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2zm9-13h.01M9 16h.01" />
        </svg>
      ),
      path: '/app/tools/cgpa-calculator',
      color: 'from-blue-500 to-blue-600',
      isAvailable: true
    },
    {
      id: 'aptitude',
      name: 'Aptitude Test Arena',
      description: 'Practice aptitude tests and improve your test-taking skills',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/app/tools/aptitude',
      color: 'from-green-500 to-green-600',
      isAvailable: false
    },
    {
      id: 'vault',
      name: 'Document Vault',
      description: 'Securely store and manage your scholarship application documents',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      path: '/app/tools/vault',
      color: 'from-purple-500 to-purple-600',
      isAvailable: false
    },
    {
      id: 'autoapply',
      name: 'Auto Apply',
      description: 'Apply to multiple scholarships at once based on your eligibility',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      path: '/app/tools/autoapply',
      color: 'from-orange-500 to-orange-600',
      isAvailable: false
    }
  ];

  const handleToolClick = (tool: Tool) => {
    if (tool.isAvailable) {
      navigate(tool.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4">
        <div className="max-w-md w-full mx-auto flex items-center gap-2">
          <LogoIcon className="h-8 w-8 text-[#2240AF]" />
          <span className="text-lg font-bold text-[#2240AF]">Tools</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-6 px-4 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Student Tools</h1>
          <p className="text-gray-600 text-sm mt-2">Enhance your scholarship journey with these powerful tools</p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              disabled={!tool.isAvailable}
              className={`w-full text-left transition-all duration-200 ${
                tool.isAvailable
                  ? 'hover:shadow-lg hover:scale-105 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`bg-gradient-to-br ${tool.color} text-white rounded-lg p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-white opacity-90 flex-shrink-0">{tool.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{tool.name}</h3>
                      {!tool.isAvailable && (
                        <span className="text-xs font-semibold bg-black bg-opacity-30 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-90 mt-1">{tool.description}</p>
                  </div>
                  {tool.isAvailable && (
                    <svg
                      className="w-5 h-5 opacity-75 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Coming Soon Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> More tools are coming soon! We're working on Aptitude Test Arena, Document Vault, and Auto Apply to make your scholarship journey even easier.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
