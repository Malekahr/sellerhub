import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiGet } from "../api/api.js";
import ReviewCard from "../components/ReviewCard.jsx";

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

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller reviews</h1>
          <p className="page-subtitle">
            Explore real user experiences with sellers, products, prices, and quality.
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
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}

export default SellerReviewsPage;