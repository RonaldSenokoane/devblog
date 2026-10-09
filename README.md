# devblog

Digital Regenesys
Full-Stack Blogging Site Project
Project Backstory: Solving a Real-World Problem
Developers constantly need a reliable source of information on the latest technologies, frameworks, best practices, and industry trends. However, many existing platforms are either cluttered, filled with outdated content, or require subscriptions.
To solve this, you have been hired to build a developer-focused blogging site
where tech enthusiasts can:
● Share insights on the latest programming languages, tools, and trends.
● Learn from other developers by reading detailed blog posts.
● Showcase their knowledge by writing and publishing technical articles.
Your goal is to develop a simple yet functional blogging platform where users can create and manage articles, upload images, and engage with relevant content—all in an easy-to-use interface.
Project Overview
Build a simple blogging site where users can:
● Sign up and log in.
● Create, read, update, and delete (CRUD) blog posts.
● Upload an image for each post.
● Add a title, subtitle, and full article content.
● View all published blog posts.
Tech Stack
● Frontend: React (Vite), plain CSS.
● Backend: Node.js with Express.js.
● Database: MongoDB with Mongoose.
● Authentication: JSON Web Token (JWT).
● File Uploads: Multer for handling images and cloudinary for storage
Features & API Endpoints
User Authentication
Metho d Endpoint Description
POST /api/auth/signu
p
Register new users
POST /api/auth/login Log in users
POST /api/auth/logo
ut
Log out users
Blog Posts
Metho d
Endpoint Description
GET /api/posts Get all blog posts GET
/api/posts/:id Get a single blog
post
POST /api/posts Create a blog post PUT
/api/posts/:id Edit a blog post
DELET
E
/api/posts/:id Delete a blog post
Database Models
User Model
const UserSchema = new mongoose.Schema({ username: { type: String,
required: true, unique: true }, email: { type: String, required: true, unique:
true }, password: { type: String, required: true },
}, { timestamps: true });
Blog Post Model
const BlogPostSchema = new mongoose.Schema({ title: { type:
String, required: true },
subtitle: { type: String },
content: { type: String, required: true }, imageUrl: { type: String
},
author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
Project Steps
1. Backend Setup
● Initialize a Node.js project (npm init -y).
Install required packages:
npm install express mongoose jsonwebtoken bcryptjs cors multer cloudinary
● Set up Express server and MongoDB connection.
● Implement authentication (register, login).
● Create API routes for blog posts.
2. Frontend Setup
Initialize React with Vite:
npm create vite@latest blog-site --template react
●
Install dependencies:
npm install axios react-router-dom
●
● Build pages:
○ Signup & Login
○ Home (All Blogs)
○ Create Blog
○ View Blog
3. Image Upload
● Use multer for handling image uploads.
● Store images using Cloudinary.
4. Testing & Deployment
● Test API with Postman.
● Deploy Backend (Render).
● Deploy Frontend ( Vercel).
Submission Requirements
● GitHub Repository (Push code).
● Live Link ( deployed).
● Demo Video (Optional).
