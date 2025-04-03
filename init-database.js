import { auth, createUserWithEmailAndPassword } from './firebase-config.js';
import { createUserDocument } from './users-service.js';
import { initUserProgress } from './user-progress-service.js';
import { createQuestion } from './questions-service.js';
import { logActivity } from './activity-service.js';

export async function initializeDatabase() {
  try {
    console.log("Starting database initialization...");
    
    // 1. Create admin user
    const adminEmail = "admin@quizapp.com";
    const adminPassword = "SecurePassword123!";
    
    console.log("Creating admin user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminEmail, 
      adminPassword
    );
    const adminUser = userCredential.user;
    console.log(`Admin user created with UID: ${adminUser.uid}`);

    // 2. Create admin document
    console.log("Creating admin document...");
    await createUserDocument(adminUser.uid, {
      email: adminEmail,
      name: "Admin User",
      role: "admin",
      preferences: {
        darkMode: true,
        dailyGoal: 20
      }
    });

    // 3. Initialize admin progress
    console.log("Initializing admin progress...");
    await initUserProgress(adminUser.uid);

    // 4. Create sample questions
    console.log("Creating sample questions...");
    const sampleQuestions = [
      {
        text: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: 1,
        explanation: "Paris has been the capital since 508 AD",
        difficulty: "Easy",
        category: "Geography",
        tags: ["capitals", "europe"]
      }
    ];

    for (const question of sampleQuestions) {
      await createQuestion(question, adminUser.uid);
    }

    // 5. Log initialization
    await logActivity(
      "System Initialization", 
      "Database initialized with admin user and sample questions",
      adminUser.uid,
      adminEmail
    );

    console.log("Database initialization complete!");
    return true;
  } catch (error) {
    console.error("Initialization failed:", error);
    throw error;
  }
}