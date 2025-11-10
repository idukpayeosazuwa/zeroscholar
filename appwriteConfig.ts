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
export const POSTS_COLLECTION_ID = 'communityPosts'; // Replace with your community posts collection ID
export const REPLIES_COLLECTION_ID_SUFFIX = '_replies'; // Suffix for reply collections if needed, though Appwrite can handle nested docs or relations.
export const SUBSCRIPTIONS_COLLECTION_ID = 'subscriptions'; // Replace with your subscriptions collection ID
export const TEST_RESULTS_COLLECTION_ID = 'testResults'; // Replace with your test results collection ID