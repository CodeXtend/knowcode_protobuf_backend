import mongoose from 'mongoose';
import dotenv, { config } from 'dotenv';

dotenv.config();

const mongoUri = process.env.DB_URI;

const connectDB = async () => {
  mongoose.connect(mongoUri).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}

export default connectDB;