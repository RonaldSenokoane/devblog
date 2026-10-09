
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import api from "./services/api.js";
import PostsPage from "./pages/PostsPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import PostDetailsPage from "./pages/PostDetailsPage.jsx";
import EditPostPage from "./pages/EditPostPage.jsx";
import "./auth.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-icon">&lt;/&gt;</span>
        DevBlog
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <a href="/#articles">Explore</a>
        <a href="/#about">About</a>
      </nav>

      <div className="nav-actions">
        <Link className="login-link" to="/login">
          Log in
        </Link>

        <Link className="button button-small" to="/register">
          Get started
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Link className="brand footer-brand" to="/">
        <span className="brand-icon">&lt;/&gt;</span>
        DevBlog
      </Link>

      <p>Write code. Share knowledge.</p>
      <span>Built for curious developers.</span>
    </footer>
  );
}

function HomePage() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="hero">
          <span className="eyebrow">
            YOUR SPACE TO BUILD AND SHARE
          </span>

          <h1>
            Write code.
            <br />
            <span>Share knowledge.</span>
          </h1>

          <p className="hero-description">
            A community for developers to share ideas, document what
            they learn, and help others grow through technology.
          </p>

          <div className="hero-actions">
            <Link className="button" to="/register">
              Start writing <span aria-hidden="true">&rarr;</span>
            </Link>

            <a className="secondary-button" href="#articles">
              Explore articles
            </a>
          </div>

          <div className="hero-note">
            <span className="status-dot" />
            Learn something. Build something. Share something.
          </div>
        </section>

        <section className="articles-section" id="articles">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COMMUNITY</span>
              <h2>Ideas worth sharing</h2>
              <p>
                Discover the topics that keep developers curious.
              </p>
            </div>

            <Link className="text-link" to="/register">
              Become a contributor &rarr;
            </Link>
          </div>

          <div className="topic-grid">
            <article className="topic-card">
              <span className="topic-icon blue-icon">
                {"</>"}
              </span>
              <span className="topic-label">
                01 / DEVELOPMENT
              </span>
              <h3>Web Development</h3>
              <p>
                Explore frontend, backend, APIs, and the tools that
                connect them.
              </p>
            </article>

            <article className="topic-card">
              <span className="topic-icon purple-icon">
                {"{ }"}
              </span>
              <span className="topic-label">
                02 / PROGRAMMING
              </span>
              <h3>Programming</h3>
              <p>
                Share solutions, explain concepts, and become a
                better problem-solver.
              </p>
            </article>

            <article className="topic-card">
              <span className="topic-icon green-icon">
                {"<*>"}
              </span>
              <span className="topic-label">
                03 / CAREER & LEARNING
              </span>
              <h3>Developer Growth</h3>
              <p>
                Document your journey, exchange lessons, and grow
                with the community.
              </p>
            </article>
          </div>
        </section>

        <section className="community-banner" id="about">
          <div>
            <span className="eyebrow">
              YOUR JOURNEY MATTERS
            </span>
            <h2>
              What you learn today could help someone tomorrow.
            </h2>
            <p>
              Turn your experience into knowledge others can use.
            </p>
          </div>

          <Link className="button banner-button" to="/register">
            Join DevBlog &rarr;
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (username.length < 3 || username.length > 30) {
      setErrorMessage(
        "Username must be between 3 and 30 characters."
      );
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setErrorMessage(
        "Password must be between 8 and 72 characters."
      );
      return;
    }

    if (password !== formData.confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            response.data.message ||
            "Account created successfully. Please log in.",
        },
      });
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            "Registration failed. Please check your details."
        );
      } else if (error.request) {
        setErrorMessage(
          "Cannot reach the server. Please check that the backend is running."
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow">JOIN THE COMMUNITY</span>
            <h1>Create your account</h1>
            <p>
              Start sharing what you learn with other developers.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-alert auth-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
                autoComplete="username"
                required
                disabled={loading}
              />
              <small>Use between 3 and 30 characters.</small>
            </div>

            <div className="auth-field">
              <label htmlFor="registerEmail">Email address</label>
              <input
                id="registerEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="registerPassword">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="registerPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <small>Use between 8 and 72 characters.</small>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-pressed={showConfirmPassword}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              className="button auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">Log in</Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const successMessage = location.state?.message;

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setErrorMessage("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        setErrorMessage(
          "The server response was incomplete. Please try again."
        );
        return;
      }

      localStorage.setItem("token", token);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            "Unable to log in. Please try again."
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
    <div className="app">
      <Navbar />

      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h1>Log in to DevBlog</h1>
            <p>
              Continue learning and sharing with the developer community.
            </p>
          </div>

          {successMessage && (
            <div className="auth-alert auth-success" role="status">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="auth-alert auth-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="loginEmail">Email address</label>
              <input
                id="loginEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="loginPassword">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="loginPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              className="button auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create an account</Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: { message: "Please log in to access your dashboard." },
        });
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data.user);
        }
      } catch (error) {
        localStorage.removeItem("token");

        if (active) {
          setErrorMessage(
            error.response?.data?.message ||
              "Your session could not be verified. Please log in again."
          );

          navigate("/login", {
            replace: true,
            state: {
              message:
                "Your session has expired or is invalid. Please log in again.",
            },
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error.message);
    } finally {
      localStorage.removeItem("token");
      navigate("/login", {
        replace: true,
        state: { message: "You have been logged out." },
      });
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="auth-page">
        <section className="auth-card">
          {loading ? (
            <p role="status">Loading your dashboard...</p>
          ) : user ? (
            <>
              <div className="auth-heading">
                <span className="eyebrow">YOUR SPACE</span>
                <h1>Welcome, {user.username}!</h1>
                <p>You are successfully logged in to DevBlog.</p>
              </div>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                Your account is ready. Next, we'll connect your dashboard
                to real blog posts.
              </p>

              <button
                className="button auth-submit"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <p role="alert">
              {errorMessage || "Unable to load your account."}
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="app">
      <Navbar />

      <main className="hero">
        <span className="eyebrow">404 ERROR</span>
        <h1>Page not found</h1>
        <p className="hero-description">
          Sorry, we could not find the page you requested.
        </p>
        <Link className="button" to="/">
          Return home
        </Link>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/new" element={<CreatePostPage />} />
        <Route path="/posts/:id/edit" element={<EditPostPage />} />
        <Route path="/posts/:id" element={<PostDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;