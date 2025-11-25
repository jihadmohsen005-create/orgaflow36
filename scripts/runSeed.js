/**
 * 🌱 Run Seed Script
 * 
 * This script runs the seed data process
 * Usage: node scripts/runSeed.js
 */

// Import the seed function
const { seedAllData } = require('./seedDataWithAttachments.ts');

// Run the seed
console.log('🚀 Starting seed process...\n');

seedAllData()
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });

