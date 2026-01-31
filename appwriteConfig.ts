import { Client, Account, Databases } from 'appwrite';

// Use environment variables with VITE_ prefix for client-side code
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '690f7de40013993815c1';

// Debug: Log configuration IMMEDIATELY
console.error('==========================================');
console.error('🔧 APPWRITE CONFIG INITIALIZATION');
console.error('==========================================');
console.error('ENDPOINT:', ENDPOINT);
console.error('PROJECT_ID:', PROJECT_ID);
console.error('ENV VITE_APPWRITE_ENDPOINT:', import.meta.env.VITE_APPWRITE_ENDPOINT);
console.error('ENV VITE_APPWRITE_PROJECT_ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID);
console.error('All import.meta.env:', import.meta.env);
console.error('==========================================');

if (!PROJECT_ID || PROJECT_ID === 'undefined') {
  console.error('❌ CRITICAL: PROJECT_ID is undefined!');
}

const client = new Client();

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

console.error('✅ Client configured with:', {
  endpoint: ENDPOINT,
  projectId: PROJECT_ID
});
console.error('==========================================');

// API Key for server-side scripts (Exported for use in scripts, NOT used by web client)
export const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
export { ID } from 'appwrite';

// Database Constants
export const DATABASE_ID = 'scholarship_db';
export const USERS_COLLECTION_ID = 'users';
export const SCHOLARSHIPS_COLLECTION_ID = 'scholarships';
export const TRACKS_COLLECTION_ID = 'eligibility_tracks';
export const USERCOURSES_COLLECTION_ID = 'usercourses';
export const VOTES_COLLECTION_ID = 'cs240_votes';
