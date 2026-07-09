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
    <>
      <style>{`
        .seller-auth-page {
          min-height: calc(100dvh - 120px);
          display: grid;
          align-items: center;
          padding: 1rem 0 5.5rem;
        }

        .seller-auth-shell {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }

        .seller-auth-intro {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 30px;
          padding: 1.15rem;
          background:
            radial-gradient(circle at top right, rgba(79, 70, 229, 0.09), transparent 34%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 241, 0.9));
          box-shadow: 0 14px 38px rgba(15, 23, 32, 0.08);
        }

        .seller-auth-eyebrow {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(23, 27, 32, 0.1);
          border-radius: 999px;
          padding: 0.48rem 0.7rem;
          background: rgba(255, 255, 255, 0.75);
          color: #4f5863;
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .seller-auth-eyebrow-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #18212b;
        }

        .seller-auth-title {
          max-width: 680px;
          margin: 1rem 0 0;
          color: #171b20;
          font-size: clamp(2.35rem, 8vw, 5rem);
          line-height: 0.92;
          letter-spacing: -0.075em;
        }

        .seller-auth-subtitle {
          max-width: 640px;
          margin: 1rem 0 0;
          color: #4f5863;
          font-size: 1rem;
          line-height: 1.65;
        }

        .seller-auth-preview {
          display: grid;
          gap: 0.7rem;
          margin-top: 1.15rem;
        }

        .seller-auth-preview-row {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid rgba(23, 27, 32, 0.08);
          border-radius: 18px;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.75);
          box-shadow: 0 8px 20px rgba(15, 23, 32, 0.045);
        }

        .seller-auth-preview-avatar {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: linear-gradient(135deg, #171b20 0%, #2b3440 100%);
          color: #ffffff;
          font-weight: 950;
        }

        .seller-auth-preview-main {
          min-width: 0;
        }

        .seller-auth-preview-main strong {
          display: block;
          color: #171b20;
          font-size: 0.94rem;
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .seller-auth-preview-main span {
          display: block;
          margin-top: 0.18rem;
          color: #8b8176;
          font-size: 0.78rem;
          font-weight: 850;
        }

        .seller-auth-preview-score {
          border-radius: 999px;
          padding: 0.35rem 0.55rem;
          background: #f8f6f1;
          color: #171b20;
          font-size: 0.78rem;
          font-weight: 950;
          white-space: nowrap;
        }

        .seller-auth-card {
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 30px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 18px 48px rgba(15, 23, 32, 0.1);
        }

        .seller-auth-card-header {
          display: grid;
          gap: 0.45rem;
          margin-bottom: 1rem;
        }

        .seller-auth-card-header h1 {
          margin: 0;
          color: #171b20;
          font-size: clamp(1.9rem, 7vw, 2.8rem);
          line-height: 0.95;
          letter-spacing: -0.065em;
        }

        .seller-auth-card-header p {
          margin: 0;
          color: #4f5863;
          line-height: 1.55;
          font-size: 0.95rem;
        }

        .seller-auth-form {
          display: grid;
          gap: 0.9rem;
        }

        .seller-auth-field {
          display: grid;
          gap: 0.42rem;
        }

        .seller-auth-field label {
          color: #252a31;
          font-size: 0.88rem;
          font-weight: 950;
        }

        .seller-auth-field input {
          width: 100%;
          min-height: 52px;
          border: 1px solid rgba(23, 27, 32, 0.12);
          border-radius: 17px;
          padding: 0 1rem;
          background: #ffffff;
          color: #171b20;
          font: inherit;
          font-weight: 800;
          outline: none;
        }

        .seller-auth-field input:focus {
          border-color: rgba(79, 70, 229, 0.45);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
        }

        .seller-auth-submit {
          width: 100%;
          min-height: 52px;
          margin-top: 0.2rem;
          border-radius: 17px;
        }

        .seller-auth-switch {
          margin: 1rem 0 0;
          border-top: 1px solid rgba(23, 27, 32, 0.08);
          padding-top: 1rem;
          color: #4f5863;
          font-size: 0.92rem;
          font-weight: 800;
          text-align: center;
        }

        .seller-auth-switch a {
          color: #4f46e5;
          font-weight: 950;
          text-decoration: none;
        }

        .seller-auth-switch a:hover {
          text-decoration: underline;
        }

        @media (min-width: 900px) {
          .seller-auth-page {
            padding-bottom: 2rem;
          }

          .seller-auth-shell {
            grid-template-columns: minmax(0, 1.05fr) 430px;
            align-items: stretch;
          }

          .seller-auth-intro,
          .seller-auth-card {
            padding: 1.35rem;
          }

          .seller-auth-intro {
            min-height: 560px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .seller-auth-preview {
            max-width: 620px;
          }
        }

        @media (max-width: 520px) {
          .seller-auth-page {
            padding-top: 0.25rem;
          }

          .seller-auth-intro {
            border-radius: 22px;
            padding: 0.9rem;
          }

          .seller-auth-card {
            border-radius: 22px;
            padding: 0.9rem;
          }

          .seller-auth-title {
            font-size: 2.25rem;
          }

          .seller-auth-subtitle {
            font-size: 0.92rem;
            line-height: 1.45;
          }

          .seller-auth-preview-row {
            grid-template-columns: 38px minmax(0, 1fr);
          }

          .seller-auth-preview-avatar {
            width: 38px;
            height: 38px;
            border-radius: 13px;
          }

          .seller-auth-preview-score {
            width: fit-content;
            grid-column: 2;
          }
        }
      `}</style>

      <section className="seller-auth-page">
        <div className="seller-auth-shell">
          <div className="seller-auth-intro">
            <div>
              <div className="seller-auth-eyebrow">
                <span className="seller-auth-eyebrow-dot"></span>
                SellerHub
              </div>

              <h1 className="seller-auth-title">
                Your trusted seller directory.
              </h1>

              <p className="seller-auth-subtitle">
                Browse community seller reviews, compare product quality, check
                seller categories and keep your own finds organized.
              </p>
            </div>

            <div className="seller-auth-preview">
              <div className="seller-auth-preview-row">
                <div className="seller-auth-preview-avatar">A</div>
                <div className="seller-auth-preview-main">
                  <strong>Anonymous</strong>
                  <span>Shoes · All types of sneakers</span>
                </div>
                <span className="seller-auth-preview-score">4.5/5</span>
              </div>

              <div className="seller-auth-preview-row">
                <div className="seller-auth-preview-avatar">W</div>
                <div className="seller-auth-preview-main">
                  <strong>Wood Table Guy2</strong>
                  <span>Shoes · 2 products added</span>
                </div>
                <span className="seller-auth-preview-score">4/5</span>
              </div>
            </div>
          </div>

          <div className="seller-auth-card">
            <div className="seller-auth-card-header">
              <h1>Welcome back</h1>
              <p>Log in to view seller reviews and manage your account.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="seller-auth-form">
              <div className="seller-auth-field">
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

              <div className="seller-auth-field">
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
                className="button button-primary seller-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="seller-auth-switch">
              No account yet? <Link to="/register">Create one here</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default LoginPage;