import { useEffect, useState } from "react";

import { apiDelete, apiGet, getUploadUrl } from "../api/api.js";

function AdminPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellerReviews, setSellerReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadAdminData() {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const [dashboardResponse, usersResponse, reviewsResponse] =
        await Promise.all([
          apiGet("/admin/dashboard"),
          apiGet("/admin/users"),
          apiGet("/seller-reviews"),
        ]);

      setDashboardData(dashboardResponse);
      setUsers(usersResponse);
      setSellerReviews(reviewsResponse);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteSellerReview(reviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this seller review?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setDeletingReviewId(reviewId);

    try {
      await apiDelete(`/admin/seller-reviews/${reviewId}`);

      setSellerReviews((previousReviews) =>
        previousReviews.filter((review) => review.id !== reviewId)
      );

      setSuccessMessage("Seller review deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingReviewId(null);
    }
  }

  async function handleDeleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? All linked product images will also be removed."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setDeletingProductId(productId);

    try {
      await apiDelete(`/admin/seller-review-products/${productId}`);

      setSellerReviews((previousReviews) =>
        previousReviews.map((review) => ({
          ...review,
          products: (review.products || []).filter(
            (product) => product.id !== productId
          ),
        }))
      );

      setSuccessMessage("Product deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingProductId(null);
    }
  }

  async function handleDeleteImage(imageId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setDeletingImageId(imageId);

    try {
      await apiDelete(`/admin/seller-product-images/${imageId}`);

      setSellerReviews((previousReviews) =>
        previousReviews.map((review) => ({
          ...review,
          products: (review.products || []).map((product) => ({
            ...product,
            images: (product.images || []).filter(
              (image) => image.id !== imageId
            ),
          })),
        }))
      );

      setSuccessMessage("Image deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingImageId(null);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="page-subtitle">
            Manage users and monitor seller reviews on SellerHub.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <p>Loading admin dashboard...</p>
        </div>
      ) : (
        <div className="stack">
          <div className="admin-dashboard-grid">
            <div className="card admin-stat-card">
              <span className="admin-stat-label">Users</span>
              <strong>{users.length}</strong>
              <p className="text-soft">Registered accounts</p>
            </div>

            <div className="card admin-stat-card">
              <span className="admin-stat-label">Seller reviews</span>
              <strong>{sellerReviews.length}</strong>
              <p className="text-soft">Visible seller reviews</p>
            </div>

            <div className="card admin-stat-card">
              <span className="admin-stat-label">Admin</span>
              <strong>{dashboardData?.admin?.username || "Unknown"}</strong>
              <p className="text-soft">{dashboardData?.admin?.email}</p>
            </div>
          </div>

          <div className="card">
            <h2>Admin account</h2>

            {dashboardData?.admin ? (
              <div className="stack">
                <p>
                  <strong>Username:</strong> {dashboardData.admin.username}
                </p>

                <p>
                  <strong>Email:</strong> {dashboardData.admin.email}
                </p>

                <p>
                  <strong>Role:</strong>{" "}
                  <span className="badge badge-accent">
                    {dashboardData.admin.role}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-soft">No admin data found.</p>
            )}
          </div>

          <div className="card">
            <div className="cluster">
              <h2>Manage seller reviews</h2>
              <span className="badge badge-muted">
                {sellerReviews.length} reviews
              </span>
            </div>

            {sellerReviews.length === 0 ? (
              <p className="text-soft">No seller reviews found.</p>
            ) : (
              <div className="admin-review-list">
                {sellerReviews.map((review) => {
                  const products = review.products || [];

                  return (
                    <div key={review.id} className="admin-review-item">
                      <div className="admin-review-main">
                        <div>
                          <h3>{review.seller_name}</h3>
                          <p className="text-soft">
                            {review.product_type} · Quality{" "}
                            {review.quality_rating}/5 · Price{" "}
                            {review.price_rating}/5
                          </p>
                        </div>

                        {review.description && (
                          <p className="admin-review-description">
                            {review.description}
                          </p>
                        )}

                        <div className="cluster">
                          <span className="badge badge-muted">
                            ID: {review.id}
                          </span>

                          <span className="badge badge-accent">
                            {products.length} product(s)
                          </span>
                        </div>

                        <div className="admin-product-list">
                          <h4>Products</h4>

                          {products.length === 0 ? (
                            <p className="text-soft">
                              No products linked to this review.
                            </p>
                          ) : (
                            products.map((product) => {
                              const images = product.images || [];

                              return (
                                <div
                                  key={product.id}
                                  className="admin-product-item"
                                >
                                  <div className="admin-product-main">
                                    <div>
                                      <strong>{product.product_name}</strong>

                                      {product.short_description && (
                                        <p className="text-soft">
                                          {product.short_description}
                                        </p>
                                      )}

                                      <div className="cluster">
                                        <span className="badge badge-muted">
                                          Product ID: {product.id}
                                        </span>

                                        <span className="badge badge-muted">
                                          {images.length} image(s)
                                        </span>
                                      </div>
                                    </div>

                                    {images.length > 0 && (
                                      <div className="admin-image-list">
                                        {images.map((image) => (
                                          <div
                                            key={image.id}
                                            className="admin-image-item"
                                          >
                                            <img
                                              src={getUploadUrl(image.file_path)}
                                              alt={
                                                image.image_label ||
                                                product.product_name
                                              }
                                            />

                                            <div>
                                              <strong>
                                                {image.image_label ||
                                                  "Product image"}
                                              </strong>
                                              <p className="text-soft">
                                                Image ID: {image.id}
                                              </p>
                                            </div>

                                            <button
                                              type="button"
                                              className="btn btn-danger btn-small"
                                              onClick={() =>
                                                handleDeleteImage(image.id)
                                              }
                                              disabled={
                                                deletingImageId === image.id
                                              }
                                            >
                                              {deletingImageId === image.id
                                                ? "Deleting..."
                                                : "Delete image"}
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    className="btn btn-danger btn-small"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    disabled={deletingProductId === product.id}
                                  >
                                    {deletingProductId === product.id
                                      ? "Deleting..."
                                      : "Delete product"}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="admin-review-actions">
                        {review.seller_link && (
                          <a
                            href={review.seller_link}
                            className="btn btn-secondary btn-small"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open seller
                          </a>
                        )}

                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteSellerReview(review.id)}
                          disabled={deletingReviewId === review.id}
                        >
                          {deletingReviewId === review.id
                            ? "Deleting..."
                            : "Delete review"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="cluster">
              <h2>Users</h2>
              <span className="badge badge-muted">{users.length} users</span>
            </div>

            {users.length === 0 ? (
              <p className="text-soft">No users found.</p>
            ) : (
              <div className="admin-user-list">
                {users.map((user) => (
                  <div key={user.id} className="admin-user-item">
                    <div>
                      <strong>{user.username}</strong>
                      <p className="text-soft">{user.email}</p>
                    </div>

                    <div className="cluster">
                      <span
                        className={
                          user.role === "admin"
                            ? "badge badge-accent"
                            : "badge badge-muted"
                        }
                      >
                        {user.role}
                      </span>

                      <span
                        className={
                          user.is_active
                            ? "badge badge-accent"
                            : "badge badge-danger"
                        }
                      >
                        {user.is_active ? "active" : "inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminPage;