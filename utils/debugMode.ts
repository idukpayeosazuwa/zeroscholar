/**
 * DEBUG MODE GUIDE
 * 
 * Use these query parameters to debug the app:
 * 
 * 1. Force clear cache and reload:
 *    http://localhost:3000/app?clearCache=true
 * 
 * 2. Show diagnostic info:
 *    http://localhost:3000/app?debug=true
 * 
 * 3. Disable offline mode temporarily:
 *    http://localhost:3000/app?noOffline=true
 * 
 * 4. Show all errors:
 *    http://localhost:3000/app?verbose=true
 */

export const useDebugMode = () => {
  const params = new URLSearchParams(window.location.search);
  
  const debug = {
    clearCache: params.has('clearCache'),
    showDiagnostics: params.has('debug'),
    noOffline: params.has('noOffline'),
    verbose: params.has('verbose'),
  };

  if (debug.clearCache) {
    console.warn('DEBUG: clearCache flag detected - clearing all caches');
    caches.keys().then(names =>
      Promise.all(names.map(name => caches.delete(name)))
    ).then(() => {
    });
  }

  if (debug.verbose) {
      online: navigator.onLine,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      cacheSupported: 'caches' in window,
      timestampEpoch: new Date().getTime(),
    });
  }

  return debug;
};
