
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { Navbar, Footer } from "../components/SiteChrome.jsx";
import "./posts.css";

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "Web Development",
  });

  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const [postResponse, userResponse] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get("/auth/me"),
        ]);

        if (!active) return;

        const post = postResponse.data.post;
        const currentUserId = userResponse.data.user?.id;

        if (
          !currentUserId ||
          !post.author?._id ||
          currentUserId !== post.author._id
        ) {
          setErrorMessage(
            "You can only edit your own blog posts."
          );
          setLoading(false);
          return;
        }

        setFormData({
          title: post.title || "",
          subtitle: post.subtitle || "",
          content: post.content || "",
          category: post.category || "Web Development",
        });

        setCurrentImageUrl(post.imageUrl || "");
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load the post for editing."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const selectedImage = event.target.files?.[0];

    setErrorMessage("");
    setImage(null);

    if (!selectedImage) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedImage.type)) {
      setErrorMessage(
        "Choose an image in JPG, PNG, or WebP format."
      );
      event.target.value = "";
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setErrorMessage("The image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImage(selectedImage);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage("Title and content are required.");
      return;
    }

    if (formData.title.trim().length > 150) {
      setErrorMessage("The title cannot exceed 150 characters.");
      return;
    }

    if (formData.subtitle.trim().length > 250) {
      setErrorMessage(
        "The subtitle cannot exceed 250 characters."
      );
      return;
    }

    setSaving(true);

    try {
      const postData = new FormData();

      postData.append("title", formData.title.trim());
      postData.append("subtitle", formData.subtitle.trim());
      postData.append("content", formData.content.trim());
      postData.append("category", formData.category);

      if (image) {
        postData.append("image", image);
      }

      const response = await api.put(
        `/posts/${id}`,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate(`/posts/${response.data.post._id}`, {
        replace: true,
        state: {
          successMessage: "Your post was updated successfully.",
        },
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update the post. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="posts-page">
        <Navbar />
        <p className="posts-message" role="status">
          Loading post...
        </p>
        <Footer />
      </div>
    );
  }

  if (errorMessage && !formData.title && !formData.content) {
    return (
      <div className="posts-page">
        <Navbar />
        <div className="create-post-container">
          <p className="posts-error" role="alert">
            {errorMessage}
          </p>

          <Link className="button" to="/posts">
            Return to articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="posts-page">
      <Navbar />
      <div className="create-post-container">
        <Link className="back-link" to={`/posts/${id}`}>
          &larr; Back to article
        </Link>

        <header className="posts-hero">
          <span className="eyebrow">YOUR ARTICLE</span>
          <h1>Edit your post</h1>
          <p>Update your article and save your changes.</p>
        </header>

        {errorMessage && (
          <p className="posts-error" role="alert">
            {errorMessage}
          </p>
        )}

        <form
          className="create-post-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="edit-category">Category</label>
          <select id="edit-category" name="category" value={formData.category} onChange={handleChange} disabled={saving}>
            {["Web Development", "JavaScript", "Frontend", "Backend", "Programming", "Career & Learning", "DevOps", "Other"].map((category) => <option key={category} value={category}>{category}</option>)}
          </select>

          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            maxLength={150}
            required
          />

          <label htmlFor="edit-subtitle">Subtitle</label>
          <input
            id="edit-subtitle"
            name="subtitle"
            type="text"
            value={formData.subtitle}
            onChange={handleChange}
            maxLength={250}
          />

          <label htmlFor="edit-content">Article content</label>
          <textarea
            id="edit-content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            required
          />

          {currentImageUrl && (
            <div>
              <p>Current cover image</p>
              <img
                src={currentImageUrl}
                alt="Current article cover"
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "420px",
                  maxHeight: "260px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              />
            </div>
          )}

          <label htmlFor="edit-image">
            Replace cover image (optional)
          </label>
          <input
            id="edit-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />

          <p className="posts-message">
            JPG, PNG, or WebP. Maximum file size: 5 MB.
            Leave the image field empty to keep the current image.
          </p>

          <button
            className="button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default EditPostPage;