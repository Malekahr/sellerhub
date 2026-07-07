import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiGet } from "../api/api.js";
import ReviewCard from "../components/ReviewCard.jsx";

function SellerReviewDetailPage() {
  const { reviewId } = useParams();

  const [review, setReview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadReview() {
    setError("");
    setIsLoading(true);

    try {
      const reviews = await apiGet("/seller-reviews");

      const foundReview = reviews.find(
        (reviewItem) => String(reviewItem.id) === String(reviewId)
      );

      if (!foundReview) {
        setReview(null);
        setError("Seller review not found.");
        return;
      }

      setReview(foundReview);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  return (
    <>
      <style>{`
        .seller-detail-page {
          width: 100%;
        }

        .seller-detail-back {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 1rem;
          color: #4f5863;
          font-weight: 900;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .seller-detail-back:hover {
          color: #087f5b;
        }

        .seller-detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .seller-detail-title-block {
          min-width: 0;
        }

        @media (max-width: 720px) {
          .seller-detail-header {
            display: grid;
          }

          .seller-detail-header .button {
            width: 100%;
          }
        }
      `}</style>

      <section className="seller-detail-page">
        <Link to="/seller-reviews" className="seller-detail-back">
          ← Back to Explore
        </Link>

        <div className="page-header seller-detail-header">
          <div className="seller-detail-title-block">
            <h1 className="page-title">
              {review?.seller_name || "Seller review"}
            </h1>

            <p className="page-subtitle">
              View seller details, products, images and Kakobuy links.
            </p>
          </div>

          <Link to="/seller-reviews/create" className="button button-primary">
            Add review
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {isLoading ? (
          <div className="card loading-state">
            <p>Loading seller review...</p>
          </div>
        ) : review ? (
          <ReviewCard review={review} />
        ) : (
          <div className="card empty-state">
            <h2>Review not found</h2>
            <p>This seller review could not be found.</p>
          </div>
        )}
      </section>
    </>
  );
}

export default SellerReviewDetailPage;