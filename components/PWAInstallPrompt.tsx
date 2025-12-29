import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const PWAInstallPrompt: React.FC = () => {
  const { showInstallButton, handleInstall, isIOS, isAndroid, installPrompt, showSuccessMessage } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [domReady, setDomReady] = useState(false);

  // Ensure DOM is ready before rendering
  useEffect(() => {
    setDomReady(true);
  }, []);

  // Don't render anything until DOM is ready
  if (!domReady) return null;

  if (!showInstallButton && !showSuccessMessage) return null;

  return (
    <>
      {/* Main Install Banner - STICKY, NON-REMOVABLE */}
      {!showInstructions ? (
        <div className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-2xl p-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span className="text-lg">📲</span> Install ScholarAI
              </h3>
              <p className="text-xs opacity-90 mt-1">Get quick access on your home screen</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstructions(true)}
                className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-xs transition-colors whitespace-nowrap font-medium"
              >
                How?
              </button>
              <button
                onClick={handleInstall}
                className="bg-white text-red-600 font-bold px-3 py-1 rounded text-xs hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Instructions Modal */
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6 shadow-2xl max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">How to Install</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* iOS Instructions */}
            {isIOS ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">📱 For iPhone/iPad:</h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Tap the <span className="font-semibold">Share</span> button (square with arrow)</li>
                    <li>Scroll down and tap <span className="font-semibold">Add to Home Screen</span></li>
                    <li>Tap <span className="font-semibold">Add</span> in the top right corner</li>
                  </ol>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            ) : isAndroid ? (
              /* Android Instructions */
              <div className="space-y-4">
                {installPrompt ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">🤖 For Android:</h4>
                      <p className="text-sm text-gray-700 mb-3">Click the Install button to add the app to your home screen</p>
                    </div>
                    <button
                      onClick={handleInstall}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-2"
                    >
                      Install Now
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">🤖 For Android:</h4>
                      <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                        <li>Tap the <span className="font-semibold">menu</span> button (three dots)</li>
                        <li>Tap <span className="font-semibold">Install app</span> or <span className="font-semibold">Add to Home Screen</span></li>
                        <li>Confirm by tapping <span className="font-semibold">Install</span></li>
                      </ol>
                    </div>
                  </>
                )}
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Generic Instructions */
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">💻 For Desktop:</h4>
                  <p className="text-sm text-gray-700">
                    Look for the <span className="font-semibold">install icon</span> in your browser's address bar, or use your browser's menu to install this app.
                  </p>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-auto text-center transform transition-all">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Installation Successful!</h2>
            <p className="text-gray-600 mb-4">
              Go to your home screen and tap the ScholarAI icon to unlock the full app experience.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 <span className="font-semibold">Tip:</span> The app will now work without an internet connection!
              </p>
            </div>
            <p className="text-xs text-gray-500">This message will close automatically...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
