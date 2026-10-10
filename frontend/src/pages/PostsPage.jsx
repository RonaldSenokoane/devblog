import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { Navbar, Footer } from "../components/SiteChrome.jsx";
import "./posts.css";

const CATEGORIES = ["All", "Web Development", "JavaScript", "Frontend", "Backend", "Programming", "Career & Learning", "DevOps", "Other"];
function formatDate(date) {
  if (!date) return "Recently published";
  return new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadPosts() {
      setLoading(true); setErrorMessage("");
      try {
        const response = await api.get("/posts", { params: { search: search || undefined, category: category === "All" ? undefined : category } });
        if (active) setPosts(response.data.posts || []);
      } catch (error) {
        if (active) setErrorMessage(error.response?.data?.message || "Unable to load articles. Check your connection and try again.");
      } finally { if (active) setLoading(false); }
    }
    loadPosts();
    return () => { active = false; };
  }, [search, category, refresh]);

  function submitSearch(event) { event.preventDefault(); setSearch(searchInput.trim()); }

  return <div className="posts-page">
    <Navbar />
    <section className="posts-hero">
      <span className="eyebrow">THE DEV BLOG COMMUNITY</span>
      <h1>Explore ideas worth sharing.</h1>
      <p>Discover tutorials, lessons, and experiences shared by developers.</p>
      <Link className="button" to={localStorage.getItem("token") ? "/posts/new" : "/login"}>Write a post <span aria-hidden="true">→</span></Link>
    </section>
    <section className="posts-content">
      <div className="posts-heading"><div><span className="eyebrow">LATEST ARTICLES</span><h2>From the community</h2></div><span className="posts-count">{posts.length} {posts.length === 1 ? "article" : "articles"}</span></div>
      <form className="posts-filters" onSubmit={submitSearch} role="search">
        <label className="search-control"><span className="sr-only">Search articles</span><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search articles, topics, or ideas…" /><button className="button" type="submit">Search</button></label>
        <label className="category-filter"><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        {(search || category !== "All") && <button className="clear-filters" type="button" onClick={() => { setSearchInput(""); setSearch(""); setCategory("All"); }}>Clear filters</button>}
      </form>
      {loading && <p className="posts-message" role="status">Loading articles…</p>}
      {!loading && errorMessage && <div className="posts-error" role="alert">{errorMessage}<button className="text-button" type="button" onClick={() => setRefresh((n) => n + 1)}>Try again</button></div>}
      {!loading && !errorMessage && posts.length === 0 && <div className="posts-empty"><h3>{search || category !== "All" ? "No matching articles found." : "Be the first to share something."}</h3><p>{search || category !== "All" ? "Try another search term or category." : "There are no articles yet. Create the first post for the community."}</p><Link className="button" to={localStorage.getItem("token") ? "/posts/new" : "/register"}>{search || category !== "All" ? "Start writing" : "Create the first post"}</Link></div>}
      {!loading && !errorMessage && posts.length > 0 && <div className="posts-grid">{posts.map((post) => <article className="post-card" key={post._id}>
        {post.imageUrl && <Link className="post-image-link" to={`/posts/${post._id}`} aria-label={`Read ${post.title}`}><img className="post-image" src={post.imageUrl} alt={post.title} loading="lazy" /></Link>}
        <div className="post-card-content"><div className="post-card-meta"><span className="category-pill">{post.category || "Web Development"}</span><span className="post-date">{formatDate(post.createdAt)}</span></div>
          <h3><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
          {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}
          <p className="post-excerpt">{(post.content || "").length > 180 ? `${post.content.slice(0, 180).trim()}…` : post.content}</p>
          <div className="post-card-footer"><span className="post-author">By {post.author?.username || "Unknown author"}</span><span className="post-engagement">♡ {post.likes?.length || 0} · Comments {post.comments?.length || 0}</span><Link className="text-link" to={`/posts/${post._id}`}>Read article →</Link></div>
        </div>
      </article>)}</div>}
    </section>
    <Footer />
  </div>;
}
