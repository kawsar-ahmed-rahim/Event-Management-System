// Usage: npm run seed:admin   (reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env)
import "dotenv/config";
import "../src/config/localDns.js";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";

const { ADMIN_NAME = "Admin", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  process.exit(1);
}

await connectDB();
let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
if (user) {
  user.role = "admin";
  await user.save();
  console.log(`Existing user ${user.email} promoted to admin.`);
} else {
  user = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin" });
  console.log(`Admin created: ${user.email}`);
}
await mongoose.disconnect();
