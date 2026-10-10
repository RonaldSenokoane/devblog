import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { Navbar, Footer } from "../components/SiteChrome.jsx";
import "./posts.css";

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

export default function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPost() {
      setLoading(true); setErrorMessage(""); setPost(null);
      try {
        const response = await api.get(`/posts/${id}`);
        if (!active) return;
        const currentPost = response.data.post;
        setPost(currentPost);
        setLikesCount(currentPost.likes?.length || 0);
        if (localStorage.getItem("token")) {
          try {
            const userResponse = await api.get("/auth/me");
            if (!active) return;
            const userId = userResponse.data.user?.id || "";
            setCurrentUserId(userId);
            setIsAuthor(Boolean(userId && userId === currentPost.author?._id));
            setLiked(Boolean(userId && currentPost.likes?.some((like) => String(like) === userId)));
          } catch { if (active) { setCurrentUserId(""); setIsAuthor(false); setLiked(false); } }
        } else { setCurrentUserId(""); setIsAuthor(false); setLiked(false); }
      } catch (error) {
        if (active) setErrorMessage(error.response?.data?.message || "Unable to load this article.");
      } finally { if (active) setLoading(false); }
    }
    loadPost();
    return () => { active = false; };
  }, [id]);

  async function toggleLike() {
    if (!localStorage.getItem("token")) {
      navigate("/login", { state: { message: "Log in to like an article." } });
      return;
    }
    setBusy(true); setErrorMessage("");
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setLiked(Boolean(data.likedByCurrentUser));
      setLikesCount(Number(data.likesCount) || 0);
    } catch (error) { setErrorMessage(error.response?.data?.message || "Unable to update your like."); }
    finally { setBusy(false); }
  }

  async function addComment(event) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    if (!localStorage.getItem("token")) {
      navigate("/login", { state: { message: "Log in to join the discussion." } });
      return;
    }
    setBusy(true); setErrorMessage("");
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text });
      setPost((previous) => previous ? { ...previous, comments: [...(previous.comments || []), data.comment] } : previous);
      setCommentText(""); setSuccessMessage("Your comment was added.");
    } catch (error) { setErrorMessage(error.response?.data?.message || "Unable to add your comment."); }
    finally { setBusy(false); }
  }

  async function deleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    setBusy(true); setErrorMessage("");
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`);
      setPost((previous) => previous ? { ...previous, comments: previous.comments.filter((comment) => comment._id !== commentId) } : previous);
      setSuccessMessage("Comment deleted.");
    } catch (error) { setErrorMessage(error.response?.data?.message || "Unable to delete this comment."); }
    finally { setBusy(false); }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    setDeleting(true); setErrorMessage("");
    try { await api.delete(`/posts/${id}`); navigate("/dashboard", { replace: true, state: { successMessage: "Your post was deleted." } }); }
    catch (error) { setErrorMessage(error.response?.data?.message || "Unable to delete this post."); setDeleting(false); }
  }

  return <div className="posts-page">
    <Navbar />
    <article className="article-container">
      <Link className="back-link" to="/posts">← Back to articles</Link>
      {loading && <p className="posts-message" role="status">Loading article…</p>}
      {!loading && errorMessage && !post && <div className="posts-error" role="alert">{errorMessage}</div>}
      {post && <>
        <header className="article-header"><span className="eyebrow">{post.category || "DEV BLOG ARTICLE"}</span><h1>{post.title}</h1>
          {post.subtitle && <p className="article-subtitle">{post.subtitle}</p>}
          <div className="article-meta"><span>By {post.author?.username || "Unknown author"}</span><span>{formatDate(post.createdAt)}</span><span>{(post.content || "").trim().split(/\s+/).filter(Boolean).length} words</span></div>
        </header>
        {errorMessage && <div className="posts-error" role="alert">{errorMessage}</div>}
        {successMessage && <p className="inline-success" role="status">{successMessage}</p>}
        {isAuthor && <div className="post-owner-actions"><Link className="secondary-button" to={`/posts/${post._id}/edit`}>Edit article</Link><button className="danger-button" type="button" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete article"}</button></div>}
        {post.imageUrl && <img className="article-cover" src={post.imageUrl} alt={post.title} />}
        <div className="article-content">{post.content}</div>
        <div className="article-reactions"><button className={`like-button ${liked ? "like-button-active" : ""}`} type="button" onClick={toggleLike} disabled={busy}>{liked ? "♥ Liked" : "♡ Like article"} <span>{likesCount}</span></button><span>{post.comments?.length || 0} comments</span></div>
        <section className="comments-section" aria-labelledby="comments-title"><div className="comments-heading"><div><span className="eyebrow">COMMUNITY</span><h2 id="comments-title">Discussion</h2></div><span>{post.comments?.length || 0} comments</span></div>
          <form className="comment-form" onSubmit={addComment}><label className="sr-only" htmlFor="commentText">Write a comment</label><textarea id="commentText" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={localStorage.getItem("token") ? "Share a helpful thought…" : "Log in to join the discussion…"} maxLength={1000} rows={3} disabled={busy} required /><div className="comment-form-footer"><small>{commentText.length}/1000</small><button className="button" type="submit" disabled={busy || !commentText.trim()}>{busy ? "Please wait…" : "Post comment"}</button></div></form>
          {!post.comments?.length ? <p className="comments-empty">No comments yet. Start the conversation.</p> : <div className="comments-list">{post.comments.map((comment) => { const commentAuthorId = comment.author?._id || comment.author; const canDelete = currentUserId && (String(commentAuthorId) === currentUserId || isAuthor); return <article className="comment-item" key={comment._id}><div className="comment-avatar">{(comment.author?.username || "D").slice(0,1).toUpperCase()}</div><div className="comment-body"><div className="comment-meta"><strong>{comment.author?.username || "DevBlog member"}</strong><time>{formatDate(comment.createdAt)}</time></div><p>{comment.text}</p>{canDelete && <button className="comment-delete" type="button" onClick={() => deleteComment(comment._id)} disabled={busy}>Delete</button>}</div></article>; })}</div>}
        </section>
        <div className="article-bottom"><Link className="button" to="/posts">Explore more articles</Link></div>
      </>}
    </article>
    <Footer />
  </div>;
}
