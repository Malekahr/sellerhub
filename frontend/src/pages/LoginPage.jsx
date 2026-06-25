import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiPost, saveToken } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { refreshCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const data = await apiPost("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      saveToken(data.access_token);
      await refreshCurrentUser();

      navigate("/seller-reviews");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <h1>Log in</h1>
        <p className="muted-text">
          Log in to view seller reviews, join groups, and manage your account.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-switch-text">
          No account yet? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;