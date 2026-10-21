import mongoose from "mongoose";

// Cache the connection on `global` so serverless invocations reuse it
// instead of opening a new connection on every request.
const cache = global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // allow retry on next request
    throw err;
  }
  return cache.conn;
}
