import mongoose from 'mongoose';

let cached = globalThis.__traceitMongoose;
if (!cached) {
  cached = globalThis.__traceitMongoose = { connection: null, promise: null };
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function connectMongo() {
  if (!isMongoConfigured()) throw new Error('MONGODB_URI is not configured. TraceIt is running in demo mode.');
  if (cached.connection) return cached.connection;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    }).then((connection) => connection).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }
  cached.connection = await cached.promise;
  return cached.connection;
}
