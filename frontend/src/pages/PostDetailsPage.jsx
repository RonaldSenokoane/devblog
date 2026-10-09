
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import "./posts.css";

function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setPost(null);
      setIsAuthor(false);

      try {
        const response = await api.get(`/posts/${id}`);

        if (!active) return;

        const currentPost = response.data.post;
        setPost(currentPost);

        const token = localStorage.getItem("token");

        if (token && currentPost.author?._id) {
          try {
            const userResponse = await api.get("/auth/me");

            if (!active) return;

            const currentUserId = userResponse.data.user?.id;

            setIsAuthor(
              Boolean(
                currentUserId &&
                currentUserId === currentPost.author._id
              )
            );
          } catch {
            if (active) setIsAuthor(false);
          }
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load this article."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.delete(`/posts/${id}`);

      navigate("/posts", {
        replace: true,
        state: {
          successMessage: "Your post was deleted successfully.",
        },
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to delete this post. Please try again."
      );
      setDeleting(false);
    }
  }

  return (
    <div className="posts-page">
      <article className="article-container">
        <Link className="back-link" to="/posts">
          &larr; Back to articles
        </Link>

        {loading && (
          <p className="posts-message" role="status">
            Loading article...
          </p>
        )}

        {!loading && errorMessage && (
          <div className="posts-error" role="alert">
            {errorMessage}
          </div>
        )}

        {!loading && successMessage && (
          <p className="posts-message" role="status">
            {successMessage}
          </p>
        )}

        {!loading && post && (
          <>
            <header className="article-header">
              <span className="eyebrow">DEV BLOG ARTICLE</span>

              <h1>{post.title}</h1>

              {post.subtitle && (
                <p className="article-subtitle">
                  {post.subtitle}
                </p>
              )}

              <div className="article-meta">
                <span>
                  By {post.author?.username || "Unknown author"}
                </span>

                <span>{formatDate(post.createdAt)}</span>
              </div>
            </header>

            {isAuthor && (
              <div
                className="post-owner-actions"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  margin: "24px 0",
                }}
              >
                <Link
                  className="button"
                  to={`/posts/${post._id}/edit`}
                >
                  Edit Post
                </Link>

                <button
                  className="button"
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            )}

            {post.imageUrl && (
              <img
                className="article-cover"
                src={post.imageUrl}
                alt={post.title}
              />
            )}

            <div className="article-content">
              {post.content}
            </div>

            <div className="article-bottom">
              <Link className="button" to="/posts">
                Explore more articles
              </Link>
            </div>
          </>
        )}
      </article>
    </div>
  );
}

export default PostDetailsPage;