import { NavLink, Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="mobile-topbar">
        <Link to="/seller-reviews" className="brand" aria-label="SellerHub home">
          <img src="/sellerhub-icon.png" alt="" style={styles.brandLogo} />
          <span>SellerHub</span>
        </Link>

        {currentUser ? (
          <button type="button" className="topbar-logout" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <NavLink to="/login" className="topbar-logout">
            Login
          </NavLink>
        )}
      </header>

      <aside className="sidebar">
        <Link
          to="/seller-reviews"
          className="brand sidebar-brand"
          aria-label="SellerHub home"
        >
          <img src="/sellerhub-icon.png" alt="" style={styles.brandLogo} />
          <span>SellerHub</span>
        </Link>

        <nav className="sidebar-nav">
          {currentUser ? (
            <>
              <div className="nav-section">
                <p className="nav-section-title">Reviews</p>

                <NavLink to="/seller-reviews" end className="nav-link">
                  Explore
                </NavLink>

                <NavLink to="/my-reviews" end className="nav-link">
                  My Reviews
                </NavLink>

                <NavLink to="/seller-reviews/create" end className="nav-link">
                  Create Review
                </NavLink>
              </div>

              <div className="nav-section">
                <p className="nav-section-title">Community</p>

                <NavLink to="/groups" end className="nav-link">
                  <span style={styles.navItemWithBadge}>
                    Groups
                    <span style={styles.soonBadge}>Soon</span>
                  </span>
                </NavLink>
              </div>

              {currentUser.role === "admin" && (
                <div className="nav-section">
                  <p className="nav-section-title">Admin</p>

                  <NavLink to="/admin" end className="nav-link">
                    Dashboard
                  </NavLink>
                </div>
              )}

              <div className="nav-section nav-section-bottom">
                <p className="nav-section-title">Account</p>

                <div className="user-pill">
                  <span className="user-avatar">
                    {currentUser.username?.charAt(0).toUpperCase()}
                  </span>

                  <div>
                    <strong>{currentUser.username}</strong>
                    <p>{currentUser.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="nav-link logout-link"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-section">
              <p className="nav-section-title">Account</p>

              <NavLink to="/login" end className="nav-link">
                Login
              </NavLink>

              <NavLink to="/register" end className="nav-link">
                Register
              </NavLink>
            </div>
          )}
        </nav>
      </aside>

      {currentUser && (
        <nav className="mobile-bottom-nav">
          <NavLink to="/seller-reviews" end className="mobile-nav-link">
            Explore
          </NavLink>

          <NavLink to="/my-reviews" end className="mobile-nav-link">
            Mine
          </NavLink>

          <NavLink to="/seller-reviews/create" end className="mobile-nav-link">
            Create
          </NavLink>

          <NavLink to="/groups" end className="mobile-nav-link">
            Groups
          </NavLink>

          {currentUser.role === "admin" && (
            <NavLink to="/admin" end className="mobile-nav-link">
              Admin
            </NavLink>
          )}
        </nav>
      )}
    </>
  );
}

const styles = {
  brandLogo: {
    width: "2.35rem",
    height: "2.35rem",
    borderRadius: "999px",
    objectFit: "cover",
    flex: "0 0 auto",
  },

  navItemWithBadge: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },

  soonBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "0.18rem 0.48rem",
    background: "rgba(255, 184, 77, 0.18)",
    color: "#9a681f",
    fontSize: "0.68rem",
    fontWeight: "900",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
};

export default Navbar;