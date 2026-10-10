
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const protect = require("./middleware/authMiddleware");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error(
        "MONGODB_URI and JWT_SECRET must be configured"
    );
}

const allowedOrigins = new Set([
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
].filter(Boolean));

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error("Origin is not allowed by DevBlog CORS")
        );
    }
}));

app.use(express.json({ limit: "1mb" }));

// API status and hosting health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the DevBlog API",
        status: "running"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "DevBlog API"
    });
});

// Application routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Retrieve the authenticated user's profile
app.get("/api/auth/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(
            "Unable to retrieve user:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to retrieve user"
        });
    }
});

// Central error handler
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof multer.MulterError) {
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5 MB or smaller"
            : "Image upload limit exceeded";

        return res.status(400).json({ message });
    }

    if (
        error.message ===
        "Only JPEG, PNG and WebP images are allowed"
    ) {
        return res.status(400).json({
            message: error.message
        });
    }

    if (
        error.message ===
        "Origin is not allowed by DevBlog CORS"
    ) {
        return res.status(403).json({
            message: "This website is not permitted to access the API"
        });
    }

    console.error("Unhandled server error:", error.message);

    return res.status(500).json({
        message: "An unexpected server error occurred"
    });
});

// Connect to MongoDB before accepting requests
async function startServer() {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`DevBlog API running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error(
        "Failed to start server:",
        error.message
    );

    process.exit(1);
});