
const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    getAllPosts,
    getMyPosts,
    getDashboardStats,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment
} = require("../controllers/postController");

const router = express.Router();

// Public routes
router.get("/", getAllPosts);

// Authenticated author dashboard routes
router.get("/mine", protect, getMyPosts);
router.get("/dashboard/stats", protect, getDashboardStats);

// Likes and comments
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

// Individual article
router.get("/:id", getPostById);
router.post("/", protect, upload.single("image"), createPost);
router.put("/:id", protect, upload.single("image"), updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;