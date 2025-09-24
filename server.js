const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root info route
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.json({
    message: "Welcome to the Node.js MongoDB API Server!",
    version: "2.0.0",
    database: {
      status: statusMap[dbState],
      name: mongoose.connection.name || "Not connected",
    },
    endpoints: {
      "GET /api/users": "Get all users (pagination/filter/sort)",
      "GET /api/users/stats": "Get user statistics",
      "GET /api/users/:id": "Get user by ID",
      "POST /api/users": "Create user",
      "PUT /api/users/:id": "Replace user by ID",
      "PATCH /api/users/:id": "Partially update user",
      "DELETE /api/users/:id": "Delete user",
    },
  });
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Error handler (after routes)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
});
