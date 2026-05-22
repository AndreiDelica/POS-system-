import { MongoMemoryServer } from 'mongodb-memory-server';

async function run() {
  try {
    console.log('Starting memory server...');
    const mongoServer = await MongoMemoryServer.create();
    console.log('URI:', mongoServer.getUri());
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

run();
