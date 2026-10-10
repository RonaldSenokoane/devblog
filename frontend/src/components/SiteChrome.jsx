import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("token")) {
      setUser(null);
      return () => { active = false; };
    }
    api.get("/auth/me")
      .then(({ data }) => { if (active) setUser(data.user || null); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, [location.pathname]);

  async function logout() {
    try { await api.post("/auth/logout"); } catch { /* Clear local session even if API logout fails. */ }
    localStorage.removeItem("token");
    setUser(null);
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
        <span className="brand-icon">&lt;/&gt;</span>DevBlog
      </Link>
      <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? "Close" : "Menu"}
      </button>
      <nav className={`nav-links ${menuOpen ? "nav-links-open" : ""}`} aria-label="Main navigation">
        <Link to="/posts" onClick={() => setMenuOpen(false)}>Explore</Link>
        <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
      </nav>
      <div className={`nav-actions ${menuOpen ? "nav-actions-open" : ""}`}>
        {user ? <>
          <Link className="login-link" to="/dashboard" onClick={() => setMenuOpen(false)}>My dashboard</Link>
          <Link className="button button-small" to="/posts/new" onClick={() => setMenuOpen(false)}>Write a post</Link>
          <button className="nav-logout" type="button" onClick={logout}>Log out</button>
        </> : <>
          <Link className="login-link" to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link className="button button-small" to="/register" onClick={() => setMenuOpen(false)}>Get started</Link>
        </>}
      </div>
    </header>
  );
}

export function Footer() {
  return <footer className="footer">
    <Link className="brand footer-brand" to="/"><span className="brand-icon">&lt;/&gt;</span>DevBlog</Link>
    <p>Write code. Share knowledge.</p>
    <span>Built for curious developers.</span>
  </footer>;
}
