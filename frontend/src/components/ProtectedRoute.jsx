import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <section className="card">
        <p>Loading...</p>
      </section>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser.role !== "admin") {
    return <Navigate to="/seller-reviews" replace />;
  }

  return children;
}

export default ProtectedRoute;