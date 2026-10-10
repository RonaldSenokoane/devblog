# DevBlog

A full-stack developer blogging platform built with React, Vite, Express, MongoDB, JWT authentication, and Cloudinary image uploads.

## Features

- Account registration, login, and logout with JWT authentication
- Create, read, update, and delete your own articles
- Article categories and server-side search
- Optional Cloudinary cover image uploads (JPEG, PNG, WebP; up to 5 MB)
- Likes and comments, with comment deletion permissions
- Author dashboard with article, like, and comment totals
- Responsive desktop and mobile layout
- Protected author actions and ownership checks on the API

## Requirements

- Node.js 18 or later
- MongoDB connection string
- Cloudinary account for image uploads (optional if not using cover images)

## Setup

### Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in your own values. Never commit `.env`.

```bash
npm start
```

The API runs at `http://localhost:5000` by default.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` if you need a custom API URL. Then run:

```bash
npm run dev
```

Open the Local URL printed by Vite, normally `http://localhost:5173`.

## API overview

- `POST /api/auth/signup` — create account
- `POST /api/auth/login` — receive JWT
- `GET /api/auth/me` — current user (authenticated)
- `GET /api/posts` — browse/search/filter articles
- `GET /api/posts/:id` — article and comments
- `POST /api/posts` — publish article (authenticated)
- `PUT /api/posts/:id` / `DELETE /api/posts/:id` — manage your own article
- `POST /api/posts/:id/like` — toggle a like (authenticated)
- `POST /api/posts/:id/comments` — add a comment (authenticated)
- `DELETE /api/posts/:id/comments/:commentId` — delete your comment or moderate comments on your own post
- `GET /api/posts/mine` and `GET /api/posts/dashboard/stats` — author dashboard (authenticated)

## Security notes

Keep all credentials in local `.env` files. If a real API key, database credential, or JWT secret has ever been shared publicly, rotate it in the relevant provider and update your local environment.
