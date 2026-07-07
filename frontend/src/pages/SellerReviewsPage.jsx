import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiGet } from "../api/api.js";

function SellerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadReviews() {
    setError("");
    setIsLoading(true);

    try {
      const data = await apiGet("/seller-reviews");
      setReviews(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function getProductCount(review) {
    if (!Array.isArray(review.products)) {
      return 0;
    }

    return review.products.length;
  }

  function getSellerInitial(review) {
    return review.seller_name?.charAt(0).toUpperCase() || "S";
  }

  function renderStars(value) {
    const rating = Number(value) || 0;
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <>
      <style>{`
        .explore-page {
          width: 100%;
        }

        .explore-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.35rem;
        }

        .explore-header-text {
          min-width: 0;
        }

        .seller-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .seller-preview-card {
          position: relative;
          min-height: 250px;
          display: grid;
          gap: 1rem;
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 26px;
          padding: 1.15rem;
          background:
            radial-gradient(circle at top right, rgba(8, 127, 91, 0.08), transparent 34%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 241, 0.88));
          color: inherit;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(15, 23, 32, 0.06);
          overflow: hidden;
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease;
        }

        .seller-preview-card:hover {
          transform: translateY(-3px);
          border-color: rgba(8, 127, 91, 0.24);
          box-shadow: 0 18px 44px rgba(15, 23, 32, 0.1);
        }

        .seller-preview-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.9rem;
        }

        .seller-preview-avatar {
          width: 52px;
          height: 52px;
          flex: 0 0 52px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: linear-gradient(135deg, #18212b 0%, #263442 100%);
          color: #ffffff;
          font-weight: 950;
          letter-spacing: -0.04em;
          box-shadow: 0 12px 24px rgba(24, 33, 43, 0.16);
        }

        .seller-preview-main {
          min-width: 0;
          flex: 1;
        }

        .seller-preview-name {
          margin: 0;
          color: #171b20;
          font-size: 1.25rem;
          font-weight: 950;
          line-height: 1.1;
          letter-spacing: -0.045em;
        }

        .seller-preview-type {
          margin: 0.35rem 0 0;
          color: #4f5863;
          font-size: 0.9rem;
          font-weight: 850;
        }

        .seller-preview-count {
          flex: 0 0 auto;
          border: 1px solid rgba(8, 127, 91, 0.16);
          border-radius: 999px;
          padding: 0.42rem 0.65rem;
          background: rgba(8, 127, 91, 0.1);
          color: #06684b;
          font-size: 0.78rem;
          font-weight: 950;
          white-space: nowrap;
        }

        .seller-preview-specialties {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: -0.2rem;
        }

        .seller-preview-specialty-chip {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 999px;
          padding: 0.36rem 0.58rem;
          background: rgba(255, 255, 255, 0.72);
          color: #18212b;
          font-size: 0.78rem;
          font-weight: 900;
        }

        .seller-preview-description {
          margin: 0;
          color: #4f5863;
          line-height: 1.55;
          font-size: 0.94rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .seller-preview-description.empty {
          color: #8b8176;
          font-style: italic;
        }

        .seller-preview-ratings {
          display: grid;
          gap: 0.65rem;
          border: 1px solid rgba(23, 27, 32, 0.08);
          border-radius: 20px;
          padding: 0.85rem;
          background: rgba(255, 255, 255, 0.68);
        }

        .seller-preview-rating-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          color: #4f5863;
          font-size: 0.86rem;
          font-weight: 850;
        }

        .seller-preview-stars {
          color: #087f5b;
          font-size: 0.88rem;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .seller-preview-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          margin-top: auto;
          padding-top: 0.2rem;
        }

        .seller-preview-date {
          color: #8b8176;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .seller-preview-cta {
          color: #18212b;
          font-size: 0.9rem;
          font-weight: 950;
          white-space: nowrap;
        }

        @media (max-width: 720px) {
          .explore-header {
            display: grid;
          }

          .explore-header .button {
            width: 100%;
          }

          .seller-preview-grid {
            grid-template-columns: 1fr;
          }

          .seller-preview-card {
            min-height: auto;
            border-radius: 22px;
            padding: 1rem;
          }

          .seller-preview-name {
            font-size: 1.15rem;
          }
        }

        @media (max-width: 390px) {
          .seller-preview-top {
            display: grid;
            grid-template-columns: 52px 1fr;
          }

          .seller-preview-count {
            width: fit-content;
            grid-column: 1 / -1;
          }
        }
      `}</style>

      <section className="explore-page">
        <div className="page-header explore-header">
          <div className="explore-header-text">
            <h1 className="page-title">Explore</h1>
            <p className="page-subtitle">
              Browse trusted sellers by category, brands and styles. Open a seller to view products,
              images and Kakobuy links.
            </p>
          </div>

          <Link to="/seller-reviews/create" className="button button-primary">
            Add review
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {isLoading ? (
          <div className="card loading-state">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card empty-state">
            <h2>No reviews yet</h2>
            <p>No seller reviews have been added yet.</p>
          </div>
        ) : (
          <div className="seller-preview-grid">
            {reviews.map((review) => (
              <Link
                key={review.id}
                to={`/seller-reviews/${review.id}`}
                className="seller-preview-card"
              >
                <div className="seller-preview-top">
                  <div className="seller-preview-avatar">
                    {getSellerInitial(review)}
                  </div>

                  <div className="seller-preview-main">
                    <h2 className="seller-preview-name">
                      {review.seller_name}
                    </h2>

                    <p className="seller-preview-type">
                      {review.product_type || "Seller review"}
                    </p>
                  </div>

                  <span className="seller-preview-count">
                    {getProductCount(review)} product
                    {getProductCount(review) === 1 ? "" : "s"}
                  </span>
                </div>

                {review.seller_specialties && (
                  <div className="seller-preview-specialties">
                    {review.seller_specialties
                      .split(",")
                      .map((specialty) => specialty.trim())
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((specialty) => (
                        <span
                          key={`${review.id}_${specialty}`}
                          className="seller-preview-specialty-chip"
                        >
                          {specialty}
                        </span>
                      ))}
                  </div>
                )}

                {review.description ? (
                  <p className="seller-preview-description">
                    {review.description}
                  </p>
                ) : (
                  <p className="seller-preview-description empty">
                    No seller description added yet.
                  </p>
                )}

                <div className="seller-preview-ratings">
                  <div className="seller-preview-rating-row">
                    <span>Quality</span>
                    <span className="seller-preview-stars">
                      {renderStars(review.quality_rating)}
                    </span>
                  </div>

                  <div className="seller-preview-rating-row">
                    <span>Price</span>
                    <span className="seller-preview-stars">
                      {renderStars(review.price_rating)}
                    </span>
                  </div>
                </div>

                <div className="seller-preview-footer">
                  <span className="seller-preview-date">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : "Review"}
                  </span>

                  <span className="seller-preview-cta">View seller →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default SellerReviewsPage;