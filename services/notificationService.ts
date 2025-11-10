import { databases, ID, DATABASE_ID, USERS_COLLECTION_ID, SUBSCRIPTIONS_COLLECTION_ID } from '../appwriteConfig';

// IMPORTANT: This VAPID key is a public key used by push services to identify the application server.
// It needs to be generated (e.g., using web-push library) and stored securely in your Appwrite Function environment variables.
// The public key is needed here on the client-side.
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your actual key

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests notification permission and saves the push subscription to the user's profile
 * for automatic scholarship alerts.
 * @param userId - The ID of the current user.
 * @returns A promise that resolves to true on success, false on failure.
 */
export const requestPermissionAndSaveSubscription = async (userId: string): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Save the subscription object to the user's profile
        const userDocRef = await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { pushSubscription: JSON.stringify(subscription) }
        );
        console.log('Push subscription saved for automatic notifications.');
        return true;
    } else {
      console.log('Unable to get permission to notify.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting permission or saving subscription:', error);
    return false;
  }
};


/**
 * Subscribes a user to a specific scholarship for manual notifications.
 * @param userId - The ID of the current user.
 * @param scholarshipId - The unique ID of the scholarship.
 * @param scholarshipName - The name of the scholarship for context.
 * @returns A promise that resolves to true on success, false on failure.
 */
export const subscribeToScholarship = async (userId: string, scholarshipId: string, scholarshipName: string): Promise<boolean> => {
  try {
    if (Notification.permission === 'granted') {
      const subscriptionRef = await databases.createDocument(
        DATABASE_ID,
        SUBSCRIPTIONS_COLLECTION_ID,
        `${userId}_${scholarshipId}`, // Use a composite key for the document ID
        {
          userId,
          scholarshipId,
          scholarshipName
        }
      );
      console.log('User manually subscribed to:', scholarshipId);
      return true;
    }
    return false;
  } catch (error) {
    // Appwrite throws an error if the document already exists, which means the user is already subscribed.
    if ((error as any).code === 409) {
        console.log('User is already subscribed.');
        return true; // Consider this a "success" in terms of UI feedback
    }
    console.error('An error occurred while subscribing to notifications.', error);
    return false;
  }
};

/**
 * Checks if a user is already subscribed to a scholarship.
 * @param userId - The ID of the current user.
 * @param scholarshipId - The unique ID of the scholarship.
 * @returns A promise that resolves to true if a subscription exists, false otherwise.
 */
export const checkSubscription = async (userId: string, scholarshipId: string): Promise<boolean> => {
  try {
    await databases.getDocument(DATABASE_ID, SUBSCRIPTIONS_COLLECTION_ID, `${userId}_${scholarshipId}`);
    return true; // Document exists
  } catch (error) {
    // Appwrite throws a 404 error if the document is not found
    if ((error as any).code === 404) {
        return false;
    }
    console.error('Error checking subscription status:', error);
    return false; // For other errors
  }
};