import { Client, Account, Databases, ID } from 'appwrite';

// Fix: Export the client instance so it can be used for real-time subscriptions in other parts of the app.
export const client = new Client();

client
    .setEndpoint('https://sfo.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('690f7de40013993815c1'); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);

// Export a unique ID generator
export { ID };

// Database and Collection IDs
export const DATABASE_ID = '690f7e600037897da65f'; // Replace with your database ID
export const USERS_COLLECTION_ID = 'users'; // Replace with your user profiles collection ID
export const SCHOLARSHIPS_COLLECTION_ID = 'eveything'; // Replace with your scholarships collection ID
export const TEST_RESULTS_COLLECTION_ID = 'testresults'; // Replace with your test results collection ID

// Scholarship schema fields (for reference):
// - title (string, 200)
// - deadline (string, 100)
// - startDate (string, 100)
// - status (string, 50) // "Open", "Closed", "Upcoming"
// - officialLink (string, 500)
// - provider (string, 200)
// - benefitInCash (string, 200)
// - modeSelection (string, 200)
// - eligibilityRules (string, 5000) // JSON string
// - description (string, 2000) // Add this
// - cgpaRequirement (string, 100) // Keep for backward compatibility
// - level (string, 100) // Keep for backward compatibility
// - courseCategory (string, 200) // Keep for backward compatibility