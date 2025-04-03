import { db, serverTimestamp } from './firebase-config.js';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// Create user document
export async function createUserDocument(userId, userData) {
  try {
    await setDoc(doc(db, "users", userId), {
      email: userData.email,
      name: userData.name || '',
      role: userData.role || 'user',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      preferences: {
        darkMode: userData.preferences?.darkMode || false,
        dailyGoal: userData.preferences?.dailyGoal || 10
      }
    });
  } catch (error) {
    console.error("Error creating user document: ", error);
    throw error;
  }
}

// Update user role (admin only)
export async function updateUserRole(userId, newRole) {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: newRole
    });
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw error;
  }
}
export async function initUserProgress(userId) {
  try {
    await setDoc(doc(db, "userProgress", userId), {
      questions: {},
      stats: {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        streak: 0,
        lastActive: serverTimestamp()
      }
    });
    console.log(`Progress initialized for user ${userId}`);
  } catch (error) {
    console.error("Error initializing user progress: ", error);
    throw error;
  }
}