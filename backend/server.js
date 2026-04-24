require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

// Import routes
const dormsRoutes = require("./routes/dorms");
const authRoutes = require("./routes/auth");

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to pass supabase to all routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Test route - verify server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running!" });
});

// Routes
app.use("/api", dormsRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export for testing 
module.exports = { app, supabase };
