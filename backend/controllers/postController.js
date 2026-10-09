
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const cloudinary = require("../config/cloudinary");

const mongoose = require("mongoose");
const BlogPost = require("../models/BlogPost");

const ALLOWED_CATEGORIES = [
    "Web Development",
    "JavaScript",
    "Frontend",
    "Backend",
    "Programming",
    "Career & Learning",
    "DevOps",
    "Other"
];

function isValidId(id) {
    return mongoose.isValidObjectId(id);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function destroyCloudinaryImage(publicId, context) {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error(`${context}:`, error.message);
    }
}

// GET /api/posts
// Supports ?search=javascript and ?category=Frontend
async function getAllPosts(req, res) {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (category && category !== "All") {
            if (!ALLOWED_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    message: "Invalid article category"
                });
            }

            filter.category = category;
        }

        if (typeof search === "string" && search.trim()) {
            const searchExpression = new RegExp(
                escapeRegex(search.trim()),
                "i"
            );

            filter.$or = [
                { title: searchExpression },
                { subtitle: searchExpression },
                { content: searchExpression }
            ];
        }

        const posts = await BlogPost.find(filter)
            .populate("author", "username")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error("Get posts error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve blog posts"
        });
    }
}

// GET /api/posts/mine
async function getMyPosts(req, res) {
    try {
        const posts = await BlogPost.find({
            author: req.user.id
        })
            .populate("author", "username")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error("Get my posts error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve your articles"
        });
    }
}

// GET /api/posts/dashboard/stats
async function getDashboardStats(req, res) {
    try {
        const posts = await BlogPost.find({
            author: req.user.id
        })
            .populate("author", "username")
            .sort({ createdAt: -1 });

        const stats = posts.reduce(
            (totals, post) => {
                totals.totalLikes += post.likes.length;
                totals.totalComments += post.comments.length;

                return totals;
            },
            {
                totalPosts: posts.length,
                totalLikes: 0,
                totalComments: 0
            }
        );

        return res.status(200).json({
            stats,
            recentPosts: posts.slice(0, 5)
        });
    } catch (error) {
        console.error("Dashboard stats error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve dashboard statistics"
        });
    }
}

// GET /api/posts/:id
async function getPostById(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid blog post ID"
            });
        }

        const post = await BlogPost.findById(id)
            .populate("author", "username")
            .populate("comments.author", "username");

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        return res.status(200).json({ post });
    } catch (error) {
        console.error("Get post error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve blog post"
        });
    }
}

// POST /api/posts
async function createPost(req, res) {
    try {
        const { title, subtitle, content, category } = req.body;

        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            (subtitle !== undefined &&
                typeof subtitle !== "string") ||
            (category !== undefined &&
                typeof category !== "string")
        ) {
            return res.status(400).json({
                message: "Invalid article fields"
            });
        }

        if (!title.trim() || !content.trim()) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        if (title.trim().length > 150) {
            return res.status(400).json({
                message: "Title cannot exceed 150 characters"
            });
        }

        if (
            subtitle !== undefined &&
            subtitle.trim().length > 250
        ) {
            return res.status(400).json({
                message: "Subtitle cannot exceed 250 characters"
            });
        }

        const selectedCategory = category?.trim() ||
            "Web Development";

        if (!ALLOWED_CATEGORIES.includes(selectedCategory)) {
            return res.status(400).json({
                message: "Please select a valid article category"
            });
        }

        let uploadedImage = null;

        try {
            if (req.file) {
                uploadedImage = await uploadToCloudinary(
                    req.file.buffer
                );
            }

            const post = await BlogPost.create({
                title: title.trim(),
                subtitle: subtitle?.trim() || "",
                content: content.trim(),
                category: selectedCategory,
                imageUrl: uploadedImage?.secure_url || "",
                imagePublicId: uploadedImage?.public_id || "",
                author: req.user.id
            });

            await post.populate("author", "username");

            return res.status(201).json({
                message: "Blog post created successfully",
                post
            });
        } catch (error) {
            if (uploadedImage?.public_id) {
                await destroyCloudinaryImage(
                    uploadedImage.public_id,
                    "New image cleanup failed"
                );
            }

            throw error;
        }
    } catch (error) {
        console.error("Create post error:", error.message);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Please check your article fields"
            });
        }

        return res.status(500).json({
            message: "Unable to create blog post"
        });
    }
}

// PUT /api/posts/:id
async function updatePost(req, res) {
    try {
        const { id } = req.params;
        const { title, subtitle, content, category } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid blog post ID"
            });
        }

        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You cannot edit another author's post"
            });
        }

        if (
            title === undefined &&
            subtitle === undefined &&
            content === undefined &&
            category === undefined &&
            !req.file
        ) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                !title.trim() ||
                title.trim().length > 150
            )
        ) {
            return res.status(400).json({
                message: "Title must be between 1 and 150 characters"
            });
        }

        if (
            subtitle !== undefined &&
            (
                typeof subtitle !== "string" ||
                subtitle.trim().length > 250
            )
        ) {
            return res.status(400).json({
                message: "Subtitle cannot exceed 250 characters"
            });
        }

        if (
            content !== undefined &&
            (
                typeof content !== "string" ||
                !content.trim()
            )
        ) {
            return res.status(400).json({
                message: "Content cannot be empty"
            });
        }

        if (
            category !== undefined &&
            (
                typeof category !== "string" ||
                !ALLOWED_CATEGORIES.includes(category.trim())
            )
        ) {
            return res.status(400).json({
                message: "Please select a valid article category"
            });
        }

        if (title !== undefined) {
            post.title = title.trim();
        }

        if (subtitle !== undefined) {
            post.subtitle = subtitle.trim();
        }

        if (content !== undefined) {
            post.content = content.trim();
        }

        if (category !== undefined) {
            post.category = category.trim();
        }

        let uploadedImage = null;

        if (req.file) {
            try {
                uploadedImage = await uploadToCloudinary(
                    req.file.buffer
                );
            } catch (error) {
                console.error("Image upload failed:", error.message);

                return res.status(502).json({
                    message: "Image upload failed"
                });
            }
        }

        if (uploadedImage) {
            const oldImagePublicId = post.imagePublicId;

            post.imageUrl = uploadedImage.secure_url;
            post.imagePublicId = uploadedImage.public_id;

            try {
                await post.save();
            } catch (error) {
                await destroyCloudinaryImage(
                    uploadedImage.public_id,
                    "New image cleanup failed"
                );

                throw error;
            }

            if (oldImagePublicId) {
                await destroyCloudinaryImage(
                    oldImagePublicId,
                    "Old image cleanup failed"
                );
            }
        } else {
            await post.save();
        }

        await post.populate("author", "username");

        return res.status(200).json({
            message: "Blog post updated successfully",
            post
        });
    } catch (error) {
        console.error("Update post error:", error.message);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Please check your article fields"
            });
        }

        return res.status(500).json({
            message: "Unable to update blog post"
        });
    }
}

// DELETE /api/posts/:id
async function deletePost(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid blog post ID"
            });
        }

        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You cannot delete another author's post"
            });
        }

        const imagePublicId = post.imagePublicId;

        await post.deleteOne();

        if (imagePublicId) {
            await destroyCloudinaryImage(
                imagePublicId,
                "Cloudinary cleanup failed"
            );
        }

        return res.status(200).json({
            message: "Blog post deleted successfully"
        });
    } catch (error) {
        console.error("Delete post error:", error.message);

        return res.status(500).json({
            message: "Unable to delete blog post"
        });
    }
}

// POST /api/posts/:id/like
async function toggleLike(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid blog post ID"
            });
        }

        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        const alreadyLiked = post.likes.some(
            (userId) => userId.toString() === req.user.id
        );

        if (alreadyLiked) {
            post.likes.pull(req.user.id);
        } else {
            post.likes.addToSet(req.user.id);
        }

        await post.save();

        return res.status(200).json({
            message: alreadyLiked
                ? "Like removed"
                : "Post liked successfully",
            likesCount: post.likes.length,
            likedByCurrentUser: !alreadyLiked
        });
    } catch (error) {
        console.error("Toggle like error:", error.message);

        return res.status(500).json({
            message: "Unable to update like"
        });
    }
}

// POST /api/posts/:id/comments
async function addComment(req, res) {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid blog post ID"
            });
        }

        if (
            typeof text !== "string" ||
            !text.trim() ||
            text.trim().length > 1000
        ) {
            return res.status(400).json({
                message: "Comment must be between 1 and 1000 characters"
            });
        }

        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        post.comments.push({
            author: req.user.id,
            text: text.trim()
        });

        await post.save();
        await post.populate("comments.author", "username");

        const comment = post.comments[post.comments.length - 1];

        return res.status(201).json({
            message: "Comment added successfully",
            comment
        });
    } catch (error) {
        console.error("Add comment error:", error.message);

        return res.status(500).json({
            message: "Unable to add comment"
        });
    }
}

// DELETE /api/posts/:id/comments/:commentId
async function deleteComment(req, res) {
    try {
        const { id, commentId } = req.params;

        if (!isValidId(id) || !isValidId(commentId)) {
            return res.status(400).json({
                message: "Invalid post or comment ID"
            });
        }

        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        const isCommentAuthor =
            comment.author.toString() === req.user.id;

        const isPostAuthor =
            post.author.toString() === req.user.id;

        if (!isCommentAuthor && !isPostAuthor) {
            return res.status(403).json({
                message: "You cannot delete this comment"
            });
        }

        comment.deleteOne();
        await post.save();

        return res.status(200).json({
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Delete comment error:", error.message);

        return res.status(500).json({
            message: "Unable to delete comment"
        });
    }
}

module.exports = {
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
};