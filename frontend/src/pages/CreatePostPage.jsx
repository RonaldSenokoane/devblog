
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { Navbar, Footer } from "../components/SiteChrome.jsx";
import "./posts.css";

function CreatePostPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "Web Development",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setErrorMessage("");

    if (!file) {
      setImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      setImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("The image must be 5 MB or smaller.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const title = formData.title.trim();
    const subtitle = formData.subtitle.trim();
    const content = formData.content.trim();

    if (!title || !content) {
      setErrorMessage("Title and article content are required.");
      return;
    }

    if (title.length > 150) {
      setErrorMessage("Title cannot exceed 150 characters.");
      return;
    }

    if (subtitle.length > 250) {
      setErrorMessage("Subtitle cannot exceed 250 characters.");
      return;
    }

    if (!localStorage.getItem("token")) {
      navigate("/login", {
        state: {
          message: "Please log in before creating a post.",
        },
      });
      return;
    }

    const postData = new FormData();
    postData.append("title", title);
    postData.append("subtitle", subtitle);
    postData.append("content", content);
    postData.append("category", formData.category);

    if (image) {
      postData.append("image", image);
    }

    setLoading(true);

    try {
      const response = await api.post("/posts", postData);

      navigate(`/posts/${response.data.post._id}`, {
        replace: true,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        navigate("/login", {
          state: {
            message: "Your session has expired. Please log in again.",
          },
        });
        return;
      }

      if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            "Unable to create your post."
        );
      } else if (error.request) {
        setErrorMessage(
          "Cannot reach the server. Check that the backend is running."
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="posts-page">
      <Navbar />
      <section className="create-post-container">
        <Link className="back-link" to="/posts">
          &larr; Back to articles
        </Link>

        <div className="create-post-heading">
          <span className="eyebrow">SHARE YOUR KNOWLEDGE</span>
          <h1>Write a new article</h1>
          <p>
            Share something you've learned with the developer community.
          </p>
        </div>

        {errorMessage && (
          <div className="posts-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="post-form-field">
            <label htmlFor="postTitle">Article title</label>
            <input
              id="postTitle"
              name="title"
              type="text"
              placeholder="e.g. Understanding JavaScript promises"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
              required
              disabled={loading}
            />
            <small>{formData.title.length}/150 characters</small>
          </div>

          <div className="post-form-field">
            <label htmlFor="postSubtitle">Subtitle (optional)</label>
            <input
              id="postSubtitle"
              name="subtitle"
              type="text"
              placeholder="Give your article a short introduction"
              value={formData.subtitle}
              onChange={handleChange}
              maxLength={250}
              disabled={loading}
            />
            <small>{formData.subtitle.length}/250 characters</small>
          </div>

          <div className="post-form-field">
            <label htmlFor="postCategory">Category</label>
            <select id="postCategory" name="category" value={formData.category} onChange={handleChange} disabled={loading}>
              { ["Web Development", "JavaScript", "Frontend", "Backend", "Programming", "Career & Learning", "DevOps", "Other"].map((category) => <option key={category} value={category}>{category}</option>) }
            </select>
          </div>

          <div className="post-form-field">
            <label htmlFor="postContent">Article content</label>
            <textarea
              id="postContent"
              name="content"
              placeholder="Start writing your article..."
              value={formData.content}
              onChange={handleChange}
              rows={12}
              required
              disabled={loading}
            />
            <small>
              {formData.content.trim().length} characters
            </small>
          </div>

          <div className="post-form-field">
            <label htmlFor="postImage">Cover image (optional)</label>
            <input
              id="postImage"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={loading}
            />
            <small>JPEG, PNG, or WebP. Maximum size: 5 MB.</small>
            {image && (
              <p className="selected-file">
                Selected: {image.name}
              </p>
            )}
          </div>

          <button
            className="button create-post-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Publishing article..." : "Publish article"}
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}

export default CreatePostPage;