// 🔍 DIAGNOSTIC COMMAND - Paste this in DevTools Console
// This will help us understand what's happening

(async () => {
  console.clear();
  console.log('🔍 DIAGNOSTIC REPORT - ' + new Date().toLocaleString());
  console.log('='.repeat(50));
  
  // 1. Check online status
  console.log('\n1️⃣ ONLINE STATUS:');
  console.log('   Online:', navigator.onLine);
  
  // 2. Check cached data
  console.log('\n2️⃣ LOCAL STORAGE:');
  const hasProfile = !!localStorage.getItem('user_profile');
  const hasScholarships = !!localStorage.getItem('scholarships_cache');
  const hasMatched = !!localStorage.getItem('matched_scholarships_cache');
  console.log('   Has profile cache:', hasProfile);
  console.log('   Has scholarships cache:', hasScholarships);
  console.log('   Has matched cache:', hasMatched);
  
  if (hasProfile) {
    const profile = JSON.parse(localStorage.getItem('user_profile'));
    console.log('   Profile data:', profile);
  }
  
  // 3. Check Service Workers
  console.log('\n3️⃣ SERVICE WORKERS:');
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('   Registrations:', registrations.length);
    registrations.forEach(r => {
      console.log(`   - Scope: ${r.scope}`);
      console.log(`   - Active: ${r.active ? '✅' : '❌'}`);
      console.log(`   - Installing: ${r.installing ? '⏳' : '❌'}`);
      console.log(`   - Waiting: ${r.waiting ? '⏸️' : '❌'}`);
    });
  }
  
  // 4. Check Cache Storage
  console.log('\n4️⃣ BROWSER CACHE STORAGE:');
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('   Caches:', cacheNames);
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      console.log(`   ${name}: ${keys.length} items`);
    }
  }
  
  // 5. Test Appwrite connectivity
  console.log('\n5️⃣ APPWRITE CONNECTIVITY:');
  try {
    const response = await fetch('https://cloud.appwrite.io/v1/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    console.log('   Appwrite health:', response.status === 200 ? '✅ OK' : '⚠️ ' + response.status);
  } catch (e) {
    console.log('   Appwrite health: ❌', e.message);
  }
  
  // 6. Check if React is responsive
  console.log('\n6️⃣ APP RESPONSIVENESS:');
  console.log('   React mounted:', !!document.getElementById('root'));
  const mainEl = document.querySelector('main');
  console.log('   Main element exists:', !!mainEl);
  console.log('   Main visible height:', mainEl?.clientHeight || 'N/A');
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 NEXT STEPS:');
  console.log('   1. Screenshot this output');
  console.log('   2. Check DevTools Network tab for pending requests');
  console.log('   3. Look for [App] logs to see loading progress');
  console.log('   4. Share the info with the dev team');
})();
