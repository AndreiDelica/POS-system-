import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, Branch } from './backend/models/index.js';
import bcrypt from 'bcryptjs';

async function run() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('Connected!');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    });
    console.log('Admin created.');

    const found = await User.findOne({ username: 'admin' }).populate('branch_id');
    console.log('Admin found', found ? found.username : null);

    const isMatch = await bcrypt.compare('admin123', found.password);
    console.log('Password match?', isMatch);

    process.exit(0);
  } catch (err) {
    console.error('Failed', err);
    process.exit(1);
  }
}
run();
