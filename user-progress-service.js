import { db, serverTimestamp } from './firebase-config.js';
import { doc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';

// Initialize user progress
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
  } catch (error) {
    console.error("Error initializing user progress: ", error);
    throw error;
  }
}

// Update progress with spaced repetition
export async function updateUserProgress(userId, questionId, performanceRating) {
  try {
    await runTransaction(db, async (transaction) => {
      const progressRef = doc(db, "userProgress", userId);
      const progressDoc = await transaction.get(progressRef);
      
      if (!progressDoc.exists()) throw "Document does not exist!";
      
      const data = progressDoc.data();
      const questionData = data.questions[questionId] || {
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0
      };
      
      // SM-2 Algorithm calculations
      let { interval, easeFactor, repetitions } = questionData;
      
      if (performanceRating >= 3) {
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - performanceRating) * 0.08));
        repetitions += 1;
        interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(interval * easeFactor);
      } else {
        repetitions = 0;
        interval = 1;
      }
      
      // Update transaction
      transaction.update(progressRef, {
        [`questions.${questionId}`]: {
          interval,
          easeFactor,
          repetitions,
          lastReviewed: serverTimestamp(),
          nextReview: new Date(Date.now() + interval * 86400000),
          performanceRating
        },
        "stats.totalQuestionsAnswered": data.stats.totalQuestionsAnswered + 1,
        "stats.lastActive": serverTimestamp(),
        ...(performanceRating >= 3 && {
          "stats.correctAnswers": data.stats.correctAnswers + 1,
          "stats.streak": data.stats.streak + 1
        })
      });
    });
  } catch (error) {
    console.error("Error updating progress: ", error);
    throw error;
  }
}