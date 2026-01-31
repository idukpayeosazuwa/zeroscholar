export default function OfflinePage() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📶</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
        <p className="text-gray-600 mb-4">
          Don't worry! Many features still work offline.
        </p>
        
        {/* Available offline features */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-green-800 mb-2">Available Offline:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• CGPA Calculator (full functionality)</li>
            <li>• View cached scholarships</li>
            <li>• View your profile</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-yellow-800 mb-2">⏳ Needs Internet:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Applying to scholarships</li>
            <li>• Updating profile</li>
            <li>• Fresh scholarship data</li>
          </ul>
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
