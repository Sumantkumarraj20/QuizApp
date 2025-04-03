import { db, serverTimestamp } from './firebase-config.js';
import { collection, addDoc } from 'firebase/firestore';

// Log activity
export async function logActivity(action, details, userId, userEmail) {
  try {
    await addDoc(collection(db, "activity"), {
      action,
      details,
      userId,
      userEmail,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity: ", error);
  }
}