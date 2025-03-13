import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';

// This script will run all migrations in the migrations folder
async function main() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './src/drizzle/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
