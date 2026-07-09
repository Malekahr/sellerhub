import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiGet } from "../api/api.js";

function SellerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minimumRating, setMinimumRating] = useState("0");
  const [sortBy, setSortBy] = useState("newest");

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

  function getAverageRating(review) {
    const qualityRating = Number(review.quality_rating) || 0;
    const priceRating = Number(review.price_rating) || 0;

    return (qualityRating + priceRating) / 2;
  }

  function formatReviewDate(dateValue) {
    if (!dateValue) {
      return "Review";
    }

    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        reviews
          .map((review) => review.product_type)
          .filter(Boolean)
          .map((category) => category.trim())
      )
    );

    return ["All", ...uniqueCategories.sort()];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const minimumRatingNumber = Number(minimumRating) || 0;

    const filtered = reviews.filter((review) => {
      const searchText = [
        review.seller_name,
        review.product_type,
        review.seller_specialties,
        review.description,
        ...(review.products || []).map((product) => product.product_name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearchQuery || searchText.includes(normalizedSearchQuery);

      const matchesCategory =
        selectedCategory === "All" || review.product_type === selectedCategory;

      const matchesRating = getAverageRating(review) >= minimumRatingNumber;

      return matchesSearch && matchesCategory && matchesRating;
    });

    return filtered.sort((firstReview, secondReview) => {
      if (sortBy === "quality") {
        return (
          Number(secondReview.quality_rating || 0) -
          Number(firstReview.quality_rating || 0)
        );
      }

      if (sortBy === "price") {
        return (
          Number(secondReview.price_rating || 0) -
          Number(firstReview.price_rating || 0)
        );
      }

      if (sortBy === "products") {
        return getProductCount(secondReview) - getProductCount(firstReview);
      }

      return (
        new Date(secondReview.created_at || 0).getTime() -
        new Date(firstReview.created_at || 0).getTime()
      );
    });
  }, [reviews, searchQuery, selectedCategory, minimumRating, sortBy]);

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <>
      <style>{`
        .seller-directory-page {
          width: 100%;
          display: grid;
          gap: 1rem;
        }

        .seller-directory-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 30px;
          padding: 1.15rem;
          background:
            radial-gradient(circle at top right, rgba(24, 33, 43, 0.08), transparent 32%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 241, 0.9));
          box-shadow: 0 12px 32px rgba(15, 23, 32, 0.07);
        }

        .seller-directory-hero-content {
          display: grid;
          gap: 1rem;
        }

        .seller-directory-eyebrow {
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

        .seller-directory-eyebrow-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #18212b;
        }

        .seller-directory-title {
          max-width: 760px;
          margin: 0;
          color: #171b20;
          font-size: clamp(2.25rem, 7vw, 4.4rem);
          line-height: 0.94;
          letter-spacing: -0.07em;
        }

        .seller-directory-subtitle {
          max-width: 680px;
          margin: 0;
          color: #4f5863;
          font-size: 1rem;
          line-height: 1.65;
        }

        .seller-directory-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .seller-directory-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .seller-directory-stat {
          border: 1px solid rgba(23, 27, 32, 0.08);
          border-radius: 20px;
          padding: 0.9rem;
          background: rgba(255, 255, 255, 0.72);
        }

        .seller-directory-stat strong {
          display: block;
          color: #171b20;
          font-size: 1.35rem;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .seller-directory-stat span {
          display: block;
          margin-top: 0.2rem;
          color: #8b8176;
          font-size: 0.8rem;
          font-weight: 850;
        }

        .seller-directory-toolbar {
          display: grid;
          gap: 0.8rem;
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 26px;
          padding: 0.9rem;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 8px 22px rgba(15, 23, 32, 0.045);
        }

        .seller-directory-search {
          width: 100%;
        }

        .seller-directory-search input,
        .seller-directory-filter select {
          width: 100%;
          min-height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(23, 27, 32, 0.12);
          background: #ffffff;
          color: #171b20;
          font: inherit;
          font-weight: 800;
          outline: none;
        }

        .seller-directory-search input {
          padding: 0 1rem;
        }

        .seller-directory-filter-grid {
          display: grid;
          gap: 0.75rem;
        }

        .seller-directory-filter {
          display: grid;
          gap: 0.35rem;
        }

        .seller-directory-filter label {
          color: #4f5863;
          font-size: 0.78rem;
          font-weight: 950;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .seller-directory-filter select {
          padding: 0 0.9rem;
        }

        .seller-directory-results-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 0.2rem;
        }

        .seller-directory-results-top h2 {
          margin: 0;
          color: #171b20;
          font-size: 1rem;
          font-weight: 950;
          letter-spacing: -0.02em;
        }

        .seller-directory-results-top span {
          color: #8b8176;
          font-size: 0.86rem;
          font-weight: 850;
        }

        .seller-directory-list {
          display: grid;
          gap: 0.7rem;
        }

        .seller-directory-row {
          display: grid;
          gap: 0.85rem;
          border: 1px solid rgba(23, 27, 32, 0.09);
          border-radius: 24px;
          padding: 0.95rem;
          background: rgba(255, 255, 255, 0.9);
          color: inherit;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(15, 23, 32, 0.045);
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .seller-directory-row:hover {
          transform: translateY(-2px);
          border-color: rgba(24, 33, 43, 0.18);
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(15, 23, 32, 0.09);
        }

        .seller-directory-row-main {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          gap: 0.85rem;
          align-items: start;
        }

        .seller-directory-avatar {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background:
            linear-gradient(135deg, #171b20 0%, #2b3440 100%);
          color: #ffffff;
          font-weight: 950;
          letter-spacing: -0.04em;
          box-shadow: 0 10px 20px rgba(23, 27, 32, 0.14);
        }

        .seller-directory-info {
          min-width: 0;
          display: grid;
          gap: 0.55rem;
        }

        .seller-directory-name-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.55rem;
        }

        .seller-directory-name {
          margin: 0;
          color: #171b20;
          font-size: 1.12rem;
          font-weight: 950;
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .seller-directory-category {
          width: fit-content;
          border: 1px solid rgba(23, 27, 32, 0.1);
          border-radius: 999px;
          padding: 0.3rem 0.55rem;
          background: #f8f6f1;
          color: #4f5863;
          font-size: 0.74rem;
          font-weight: 950;
          white-space: nowrap;
        }

        .seller-directory-description {
          margin: 0;
          color: #4f5863;
          font-size: 0.92rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .seller-directory-description.empty {
          color: #8b8176;
          font-style: italic;
        }

        .seller-directory-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .seller-directory-tag {
          border: 1px solid rgba(23, 27, 32, 0.08);
          border-radius: 999px;
          padding: 0.28rem 0.5rem;
          background: rgba(248, 246, 241, 0.82);
          color: #4f5863;
          font-size: 0.75rem;
          font-weight: 850;
        }

        .seller-directory-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .seller-directory-metric {
          border: 1px solid rgba(23, 27, 32, 0.08);
          border-radius: 16px;
          padding: 0.65rem;
          background: rgba(248, 246, 241, 0.62);
        }

        .seller-directory-metric-label {
          display: block;
          color: #8b8176;
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .seller-directory-metric-value {
          display: block;
          margin-top: 0.28rem;
          color: #171b20;
          font-size: 0.9rem;
          font-weight: 950;
        }

        .seller-directory-stars {
          color: #18212b;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .seller-directory-row-side {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding-top: 0.2rem;
        }

        .seller-directory-date {
          color: #8b8176;
          font-size: 0.8rem;
          font-weight: 850;
        }

        .seller-directory-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          border-radius: 999px;
          padding: 0 0.9rem;
          background: #171b20;
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 950;
          white-space: nowrap;
          transition:
            transform 160ms ease,
            background 160ms ease;
        }

        .seller-directory-row:hover .seller-directory-link {
          transform: translateX(2px);
          background: #4f46e5;
        }

        @media (min-width: 720px) {
          .seller-directory-hero {
            padding: 1.35rem;
          }

          .seller-directory-hero-content {
            grid-template-columns: minmax(0, 1fr) 300px;
            align-items: end;
          }

          .seller-directory-filter-grid {
            grid-template-columns: 1.1fr 0.8fr 0.8fr;
          }

          .seller-directory-row {
            grid-template-columns: minmax(0, 1fr) 360px;
            align-items: center;
          }

          .seller-directory-row-side {
            justify-content: flex-end;
          }
        }

        @media (max-width: 720px) {
          .seller-directory-page {
            gap: 0.75rem;
          }

          .seller-directory-hero {
            border-radius: 22px;
            padding: 0.85rem;
          }

          .seller-directory-hero-actions .button {
            width: 100%;
            min-height: 42px;
          }

          .seller-directory-title {
            font-size: clamp(1.9rem, 9vw, 2.8rem);
          }

          .seller-directory-subtitle {
            font-size: 0.92rem;
            line-height: 1.45;
          }

          .seller-directory-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.45rem;
          }

          .seller-directory-stat {
            min-height: 74px;
            border-radius: 16px;
            padding: 0.65rem 0.55rem;
          }

          .seller-directory-stat strong {
            font-size: 1.15rem;
          }

          .seller-directory-stat span {
            margin-top: 0.12rem;
            font-size: 0.66rem;
            line-height: 1.15;
          }

          .seller-directory-toolbar {
            gap: 0.6rem;
            border-radius: 20px;
            padding: 0.65rem;
          }

          .seller-directory-search input {
            min-height: 42px;
            border-radius: 14px;
            padding: 0 0.85rem;
            font-size: 0.9rem;
          }

          .seller-directory-filter-grid {
            display: flex;
            gap: 0.55rem;
            overflow-x: auto;
            padding-bottom: 0.15rem;
            scrollbar-width: none;
          }

          .seller-directory-filter-grid::-webkit-scrollbar {
            display: none;
          }

          .seller-directory-filter {
            min-width: 148px;
            gap: 0.25rem;
          }

          .seller-directory-filter label {
            font-size: 0.62rem;
            letter-spacing: 0.06em;
          }

          .seller-directory-filter select {
            min-height: 40px;
            border-radius: 14px;
            padding: 0 0.65rem;
            font-size: 0.82rem;
          }

          .seller-directory-results-top {
            display: grid;
            gap: 0.2rem;
          }

          .seller-directory-metrics {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 420px) {
          .seller-directory-hero,
          .seller-directory-toolbar,
          .seller-directory-row {
            border-radius: 22px;
          }

          .seller-directory-eyebrow {
            padding: 0.38rem 0.58rem;
            font-size: 0.64rem;
          }

          .seller-directory-stats {
            gap: 0.38rem;
          }

          .seller-directory-stat {
            min-height: 68px;
            padding: 0.58rem 0.45rem;
          }

          .seller-directory-stat strong {
            font-size: 1.05rem;
          }

          .seller-directory-stat span {
            font-size: 0.62rem;
          }

          .seller-directory-row-main {
            grid-template-columns: 42px minmax(0, 1fr);
          }

          .seller-directory-avatar {
            width: 42px;
            height: 42px;
            border-radius: 14px;
          }

          .seller-directory-row-side {
            display: grid;
          }

          .seller-directory-link {
            width: 100%;
          }
        }
      `}</style>

      <section className="seller-directory-page">
        <div className="seller-directory-hero">
          <div className="seller-directory-hero-content">
            <div>
              <div className="seller-directory-eyebrow">
                <span className="seller-directory-eyebrow-dot"></span>
                Seller directory
              </div>

              <h1 className="seller-directory-title">
                Explore trusted sellers
              </h1>

              <p className="seller-directory-subtitle">
                Search by seller, category, brand or style. Open a seller to
                view products, images and agent links.
              </p>
            </div>

            <div className="seller-directory-hero-actions">
              <Link to="/seller-reviews/create" className="button button-primary">
                Add review
              </Link>
            </div>
          </div>
        </div>

        <div className="seller-directory-stats">
          <div className="seller-directory-stat">
            <strong>{reviews.length}</strong>
            <span>Total sellers</span>
          </div>

          <div className="seller-directory-stat">
            <strong>
              {reviews.reduce(
                (total, review) => total + getProductCount(review),
                0
              )}
            </strong>
            <span>Total products</span>
          </div>

          <div className="seller-directory-stat">
            <strong>{filteredReviews.length}</strong>
            <span>Visible results</span>
          </div>
        </div>

        <div className="seller-directory-toolbar">
          <div className="seller-directory-search">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sellers, brands or products"
            />
          </div>

          <div className="seller-directory-filter-grid">
            <div className="seller-directory-filter">
              <label htmlFor="seller_category_filter">Category</label>
              <select
                id="seller_category_filter"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All categories" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="seller-directory-filter">
              <label htmlFor="seller_rating_filter">Minimum rating</label>
              <select
                id="seller_rating_filter"
                value={minimumRating}
                onChange={(event) => setMinimumRating(event.target.value)}
              >
                <option value="0">Any rating</option>
                <option value="3">3/5 or higher</option>
                <option value="4">4/5 or higher</option>
                <option value="5">5/5 only</option>
              </select>
            </div>

            <div className="seller-directory-filter">
              <label htmlFor="seller_sort_filter">Sort by</label>
              <select
                id="seller_sort_filter"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="quality">Best quality</option>
                <option value="price">Best price</option>
                <option value="products">Most products</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {isLoading ? (
          <div className="card loading-state">
            <p>Loading sellers...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card empty-state">
            <h2>No reviews yet</h2>
            <p>No seller reviews have been added yet.</p>
          </div>
        ) : (
          <>
            <div className="seller-directory-results-top">
              <h2>Seller results</h2>
              <span>
                Showing {filteredReviews.length} of {reviews.length} sellers
              </span>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="card empty-state">
                <h2>No matching sellers</h2>
                <p>Try another search, category or rating filter.</p>
              </div>
            ) : (
              <div className="seller-directory-list">
                {filteredReviews.map((review) => (
                  <Link
                    key={review.id}
                    to={`/seller-reviews/${review.id}`}
                    className="seller-directory-row"
                  >
                    <div className="seller-directory-row-main">
                      <div className="seller-directory-avatar">
                        {getSellerInitial(review)}
                      </div>

                      <div className="seller-directory-info">
                        <div className="seller-directory-name-line">
                          <h2 className="seller-directory-name">
                            {review.seller_name}
                          </h2>

                          <span className="seller-directory-category">
                            {review.product_type || "Seller review"}
                          </span>
                        </div>

                        {review.seller_specialties && (
                          <div className="seller-directory-tags">
                            {review.seller_specialties
                              .split(",")
                              .map((specialty) => specialty.trim())
                              .filter(Boolean)
                              .slice(0, 5)
                              .map((specialty) => (
                                <span
                                  key={`${review.id}_${specialty}`}
                                  className="seller-directory-tag"
                                >
                                  {specialty}
                                </span>
                              ))}
                          </div>
                        )}

                        {review.description ? (
                          <p className="seller-directory-description">
                            {review.description}
                          </p>
                        ) : (
                          <p className="seller-directory-description empty">
                            No seller description added yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="seller-directory-metrics">
                        <div className="seller-directory-metric">
                          <span className="seller-directory-metric-label">
                            Quality
                          </span>
                          <span className="seller-directory-metric-value seller-directory-stars">
                            {renderStars(review.quality_rating)}
                          </span>
                        </div>

                        <div className="seller-directory-metric">
                          <span className="seller-directory-metric-label">
                            Price
                          </span>
                          <span className="seller-directory-metric-value seller-directory-stars">
                            {renderStars(review.price_rating)}
                          </span>
                        </div>

                        <div className="seller-directory-metric">
                          <span className="seller-directory-metric-label">
                            Products
                          </span>
                          <span className="seller-directory-metric-value">
                            {getProductCount(review)}
                          </span>
                        </div>
                      </div>

                      <div className="seller-directory-row-side">
                        <span className="seller-directory-date">
                          {formatReviewDate(review.created_at)}
                        </span>

                        <span className="seller-directory-link">
                          View seller →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default SellerReviewsPage;