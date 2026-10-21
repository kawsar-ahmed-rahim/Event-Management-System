// Local development entry point. (On Vercel, api/index.js is used instead.)
import "dotenv/config";
import "./src/config/localDns.js";
import app from "./app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  console.log("Database connected.");
} catch (err) {
  console.error("Database connection failed:", err.message);
}

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}/api/v1`));
