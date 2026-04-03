import mongoose from 'mongoose';

// MongoDB Connection
if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL environment variable is required.");
}

// Connection health events
mongoose.connection.on("error", (err) => console.error("[MongoDB] connection error:", err));
mongoose.connection.on("disconnected", () => console.warn("[MongoDB] disconnected"));
mongoose.connection.on("reconnected", () => console.info("[MongoDB] reconnected"));

export const connectMongoDB = async () => {
  if (!process.env.MONGODB_URL) return;
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      tls: process.env.MONGODB_URL.includes('+srv'),
      tlsAllowInvalidCertificates: process.env.MONGODB_URL.includes('+srv') ? true : undefined,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error (non-fatal, server will continue):', err);
    // Do not exit — server can still serve the app without MongoDB
  }
};
