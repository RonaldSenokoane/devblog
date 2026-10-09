
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import "./posts.css";

function formatDate(date) {
  if (!date) return "Recently published";

  return new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const response = await api.get("/posts");

        if (active) {
          setPosts(response.data.posts || []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load blog posts. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="posts-page">
      <section className="posts-hero">
        <span className="eyebrow">THE DEV BLOG COMMUNITY</span>
        <h1>Explore ideas worth sharing.</h1>
        <p>
          Discover tutorials, lessons, and experiences shared
          by developers.
        </p>

        <Link className="button" to="/posts/new">
          Write a post <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      <section className="posts-content">
        <div className="posts-heading">
          <div>
            <span className="eyebrow">LATEST ARTICLES</span>
            <h2>From the community</h2>
          </div>

          <span className="posts-count">
            {posts.length} {posts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {loading && (
          <p className="posts-message" role="status">
            Loading articles...
          </p>
        )}

        {!loading && errorMessage && (
          <div className="posts-error" role="alert">
            {errorMessage}
            <button
              className="text-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !errorMessage && posts.length === 0 && (
          <div className="posts-empty">
            <h3>Be the first to share something.</h3>
            <p>
              There are no articles yet. Create the first post
              for the DevBlog community.
            </p>
            <Link className="button" to="/posts/new">
              Create the first post
            </Link>
          </div>
        )}

        {!loading && !errorMessage && posts.length > 0 && (
          <div className="posts-grid">
            {posts.map((post) => (
              <article className="post-card" key={post._id}>
                {post.imageUrl && (
                  <Link
                    className="post-image-link"
                    to={`/posts/${post._id}`}
                    aria-label={`Read ${post.title}`}
                  >
                    <img
                      className="post-image"
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                    />
                  </Link>
                )}

                <div className="post-card-content">
                  <span className="post-date">
                    {formatDate(post.createdAt)}
                  </span>

                  <h3>
                    <Link to={`/posts/${post._id}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {post.subtitle && (
                    <p className="post-subtitle">
                      {post.subtitle}
                    </p>
                  )}

                  <p className="post-excerpt">
                    {post.content.length > 180
                      ? `${post.content.slice(0, 180).trim()}...`
                      : post.content}
                  </p>

                  <div className="post-card-footer">
                    <span className="post-author">
                      By {post.author?.username || "Unknown author"}
                    </span>

                    <Link
                      className="text-link"
                      to={`/posts/${post._id}`}
                    >
                      Read article &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PostsPage;