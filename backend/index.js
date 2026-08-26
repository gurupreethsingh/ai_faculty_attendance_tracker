const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// =====================================================
// ROUTES
// =====================================================

const userRoutes = require("./routes/UserRoutes");
const contactRoutes = require("./routes/ContactRoutes");
const subscriptionRoutes = require("./routes/SubscriptionRoutes");
const facultyRoutes = require("./routes/FacultyRoutes");

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(cookieParser());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// =====================================================
// STATIC FILES
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================================
// ROOT
// =====================================================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Travel Website Backend API is running successfully.",
  });
});

// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy.",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/faculty", facultyRoutes);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, _req, res, _next) => {
  console.error("GLOBAL SERVER ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// =====================================================
// DATABASE
// =====================================================

const DATABASE_URL =
  process.env.DATABASE || "mongodb://127.0.0.1:27017/login_logout_template";

const PORT = process.env.PORT || 3112;

// =====================================================
// CONNECT DATABASE
// =====================================================

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB successfully.");

    app.listen(PORT, () => {
      console.log(`Server running successfully on port ${PORT}`);

      console.log(
        `Faculty Profile: http://localhost:${PORT}/api/faculty/get-faculty-profile`,
      );

      console.log(
        `Current Timetable: http://localhost:${PORT}/api/timetable/my/current-week`,
      );

      console.log(
        `Attendance Summary: http://localhost:${PORT}/api/attendance/my-summary`,
      );
    });
  })
  .catch((err) => {
    console.error("Connection to MongoDB failed:", err);

    process.exit(1);
  });
