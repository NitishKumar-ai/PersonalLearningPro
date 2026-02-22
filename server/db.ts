import mongoose from 'mongoose';

// MongoDB Connection
if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL environment variable is required.");
}

export const connectMongoDB = async () => {
  if (!process.env.MONGODB_URL) return;
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
