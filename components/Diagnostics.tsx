import React, { useState, useEffect } from 'react';

const DiagnosticPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const [cacheList, setCacheList] = useState<string[]>([]);

  useEffect(() => {
    const runDiagnostics = async () => {
      const diag: Record<string, any> = {};

      // 1. Check Service Worker status
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          diag.swRegistrations = registrations.length;
          diag.swUrls = registrations.map(r => r.scope);
        } catch (e) {
          diag.swError = String(e);
        }
      }

      // 2. Check Cache API
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          setCacheList(cacheNames);
          diag.caches = cacheNames;
        } catch (e) {
          diag.cachesError = String(e);
        }
      }

      // 3. Check localStorage
      diag.localStorageKeys = Object.keys(localStorage);
      diag.localStorageSize = new Blob(Object.values(localStorage)).size;

      // 4. Check online status
      diag.isOnline = navigator.onLine;

      // 5. Check viewport
      diag.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // 6. Check DOM root
      const root = document.getElementById('root');
      diag.rootExists = !!root;
      diag.rootHTML = root?.innerHTML.substring(0, 200) || 'Not found';

      // 7. Check for visible elements
      const main = document.querySelector('main');
      diag.mainExists = !!main;
      diag.mainVisible = main ? (main as HTMLElement).offsetHeight > 0 : false;

      setDiagnostics(diag);
    };

    runDiagnostics();
  }, []);

  const clearAllCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      alert('All caches cleared! Reload the page.');
    } catch (e) {
      alert('Error clearing cache: ' + String(e));
    }
  };

  const clearSW = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
      alert('All Service Workers unregistered! Reload the page.');
    } catch (e) {
      alert('Error unregistering SW: ' + String(e));
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('LocalStorage cleared! Reload the page.');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diagnostic Dashboard</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">⚠️ Nuclear Options (Last Resort)</h2>
        <div className="space-y-2">
          <button
            onClick={clearAllCache}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            🗑️ Clear ALL Browser Caches
          </button>
          <button
            onClick={clearSW}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            🗑️ Unregister ALL Service Workers
          </button>
          <button
            onClick={clearLocalStorage}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            🗑️ Clear LocalStorage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h3 className="font-semibold text-sm text-gray-600 mb-2">{key}</h3>
            <p className="text-sm text-gray-900 break-all">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">📦 Cached Items</h2>
        {cacheList.length > 0 ? (
          <div className="space-y-2">
            {cacheList.map(cache => (
              <div key={cache} className="bg-white p-2 rounded text-sm">
                {cache}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No caches found</p>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">🔧 Developer Tips</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Open DevTools (F12) → Application → Service Workers</li>
          <li>• Check "Offline" checkbox to test PWA functionality</li>
          <li>• Clear Site Data: DevTools → Application → Storage → Clear site data</li>
          <li>• Check Console for errors</li>
          <li>• Check Network tab and filter for "all" requests</li>
          <li>• Look for red errors in service worker registration</li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticPage;
