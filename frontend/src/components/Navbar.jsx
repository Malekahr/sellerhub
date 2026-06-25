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
        <Link to="/seller-reviews" className="brand">
          <span className="brand-mark">S</span>
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
        <Link to="/seller-reviews" className="brand sidebar-brand">
          <span className="brand-mark">S</span>
          <span>SellerHub</span>
        </Link>

        <nav className="sidebar-nav">
          {currentUser ? (
            <>
              <div className="nav-section">
                <p className="nav-section-title">Reviews</p>

                <NavLink to="/seller-reviews" className="nav-link">
                  All reviews
                </NavLink>

                <NavLink to="/my-reviews" className="nav-link">
                  My reviews
                </NavLink>

                <NavLink to="/seller-reviews/create" className="nav-link">
                  Create review
                </NavLink>
              </div>

              <div className="nav-section">
                <p className="nav-section-title">Community</p>

                <NavLink to="/groups" className="nav-link">
                  Groups
                </NavLink>
              </div>

              {currentUser.role === "admin" && (
                <div className="nav-section">
                  <p className="nav-section-title">Admin</p>

                  <NavLink to="/admin" className="nav-link">
                    Admin dashboard
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

              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>

              <NavLink to="/register" className="nav-link">
                Register
              </NavLink>
            </div>
          )}
        </nav>
      </aside>

      {currentUser && (
        <nav className="mobile-bottom-nav">
          <NavLink to="/seller-reviews" className="mobile-nav-link">
            Reviews
          </NavLink>

          <NavLink to="/my-reviews" className="mobile-nav-link">
            Mine
          </NavLink>

          <NavLink to="/seller-reviews/create" className="mobile-nav-link">
            Create
          </NavLink>

          <NavLink to="/groups" className="mobile-nav-link">
            Groups
          </NavLink>

          {currentUser.role === "admin" && (
            <NavLink to="/admin" className="mobile-nav-link">
              Admin
            </NavLink>
          )}
        </nav>
      )}
    </>
  );
}

export default Navbar;