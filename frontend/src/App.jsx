import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CreateSellerReviewPage from "./pages/CreateSellerReviewPage.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyReviewsPage from "./pages/MyReviewsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SellerReviewsPage from "./pages/SellerReviewsPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/seller-reviews" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/seller-reviews"
          element={
            <ProtectedRoute>
              <SellerReviewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller-reviews/create"
          element={
            <ProtectedRoute>
              <CreateSellerReviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reviews"
          element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;