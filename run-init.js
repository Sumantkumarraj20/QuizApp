import { initializeDatabase } from './init-database.js';

async function run() {
  try {
    await initializeDatabase();
    console.log("✅ Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
    process.exit(1);
  }
}

run();