import { db, serverTimestamp } from './firebase-config.js';
import { collection, addDoc, setDoc, doc, updateDoc } from 'firebase/firestore';

// Create new question
export async function createQuestion(questionData, userId) {
  try {
    const docRef = await addDoc(collection(db, "questions"), {
      ...questionData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating question: ", error);
    throw error;
  }
}

// Update question
export async function updateQuestion(questionId, updates) {
  try {
    await updateDoc(doc(db, "questions", questionId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating question: ", error);
    throw error;
  }
}