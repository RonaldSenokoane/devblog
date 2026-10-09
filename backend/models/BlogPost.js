
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const blogPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        subtitle: {
            type: String,
            trim: true,
            maxlength: 250,
            default: ""
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            trim: true,
            enum: [
                "Web Development",
                "JavaScript",
                "Frontend",
                "Backend",
                "Programming",
                "Career & Learning",
                "DevOps",
                "Other"
            ],
            default: "Web Development"
        },
        imageUrl: {
            type: String,
            default: ""
        },
        imagePublicId: {
            type: String,
            default: ""
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        comments: {
            type: [commentSchema],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);