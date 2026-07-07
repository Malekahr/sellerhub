import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiPost } from "../api/api.js";

function CreateSellerReviewPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    seller_name: "",
    seller_link: "",
    product_type: "",
    quality_rating: "5",
    price_rating: "5",
    description: "",
    product_name: "",
    purchase_date: "",
    short_description: "",
    product_link: "",
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
      await apiPost("/seller-reviews", {
        seller_name: formData.seller_name.trim(),
        seller_link: formData.seller_link.trim(),
        product_type: formData.product_type.trim(),
        quality_rating: Number(formData.quality_rating),
        price_rating: Number(formData.price_rating),
        description: formData.description.trim(),
        products: [
          {
            product_name: formData.product_name.trim(),
            purchase_date: formData.purchase_date || null,
            short_description: formData.short_description.trim(),
            product_link: formData.product_link.trim() || null,
          },
        ],
      });

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
        .create-review-page {
          width: 100%;
          padding-bottom: 5.5rem;
        }

        .create-review-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 28px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          background:
            radial-gradient(circle at top left, rgba(255, 190, 92, 0.42), transparent 34%),
            radial-gradient(circle at bottom right, rgba(45, 38, 30, 0.09), transparent 30%),
            #fffaf2;
          box-shadow: 0 18px 48px rgba(47, 38, 28, 0.1);
        }

        .create-review-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 999px;
          padding: 0.55rem 0.75rem;
          background: rgba(255, 255, 255, 0.72);
          color: #5d5044;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .create-review-badge-dot {
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 999px;
          background: #ffb84d;
          box-shadow: 0 0 0 6px rgba(255, 184, 77, 0.18);
        }

        .create-review-title {
          max-width: 760px;
          margin: 0;
          color: #1f1c18;
          font-size: clamp(2.2rem, 9vw, 4.7rem);
          line-height: 0.94;
          letter-spacing: -0.065em;
        }

        .create-review-subtitle {
          max-width: 660px;
          margin: 1rem 0 0;
          color: #6b6258;
          font-size: 1rem;
          line-height: 1.65;
        }

        .create-review-layout {
          display: grid;
          gap: 1rem;
          align-items: start;
        }

        .create-review-card {
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 28px;
          padding: 1rem;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 250, 242, 0.78)),
            #fffaf2;
          box-shadow: 0 18px 48px rgba(47, 38, 28, 0.09);
        }

        .create-review-form {
          display: grid;
          gap: 1rem;
        }

        .create-review-section {
          display: grid;
          gap: 0.9rem;
          border: 1px solid rgba(45, 38, 30, 0.08);
          border-radius: 24px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.58);
        }

        .create-review-section-header {
          margin-bottom: 0.15rem;
        }

        .create-review-section-header h2 {
          margin: 0;
          color: #1f1c18;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
        }

        .create-review-section-header p {
          margin: 0.35rem 0 0;
          color: #746a60;
          font-size: 0.92rem;
          line-height: 1.45;
        }

        .create-review-grid {
          display: grid;
          gap: 0.9rem;
        }

        .create-review-field {
          display: grid;
          gap: 0.42rem;
        }

        .create-review-field label {
          color: #2d271f;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .create-review-field input,
        .create-review-field select,
        .create-review-field textarea {
          width: 100%;
          border: 1px solid rgba(45, 38, 30, 0.14);
          border-radius: 18px;
          padding: 0.9rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          color: #1f1c18;
          font: inherit;
          outline: none;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .create-review-field textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.55;
        }

        .create-review-field input:focus,
        .create-review-field select:focus,
        .create-review-field textarea:focus {
          border-color: rgba(31, 28, 24, 0.42);
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(255, 184, 77, 0.18);
        }

        .create-review-field small {
          color: #82786d;
          font-size: 0.78rem;
          line-height: 1.45;
        }

        .create-review-ratings {
          display: grid;
          gap: 0.9rem;
        }

        .create-review-rating-card {
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 20px;
          padding: 0.9rem;
          background: rgba(255, 250, 242, 0.75);
        }

        .create-review-rating-top {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.65rem;
        }

        .create-review-rating-top label {
          color: #2d271f;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .create-review-stars {
          color: #b17b2c;
          font-size: 0.88rem;
          font-weight: 950;
          white-space: nowrap;
        }

        .create-review-rating-card select {
          width: 100%;
          border: 1px solid rgba(45, 38, 30, 0.14);
          border-radius: 16px;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.92);
          color: #1f1c18;
          font: inherit;
          outline: none;
        }

        .create-review-side-card {
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 28px;
          padding: 1rem;
          background:
            radial-gradient(circle at top right, rgba(255, 190, 92, 0.28), transparent 38%),
            rgba(255, 250, 242, 0.88);
          box-shadow: 0 18px 48px rgba(47, 38, 28, 0.08);
        }

        .create-review-side-card h2 {
          margin: 0;
          color: #1f1c18;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
        }

        .create-review-checklist {
          display: grid;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .create-review-check-item {
          display: flex;
          gap: 0.7rem;
          align-items: flex-start;
          color: #6b6258;
          font-size: 0.92rem;
          line-height: 1.45;
        }

        .create-review-check-icon {
          flex: 0 0 24px;
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: #1f1c18;
          color: #fffaf2;
          font-size: 0.78rem;
          font-weight: 950;
        }

        .create-review-link-note {
          margin-top: 1rem;
          border: 1px dashed rgba(45, 38, 30, 0.22);
          border-radius: 20px;
          padding: 0.95rem;
          background: rgba(255, 255, 255, 0.55);
          color: #746a60;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .create-review-link-note strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #1f1c18;
        }

        .create-review-actions {
          display: grid;
          gap: 0.75rem;
        }

        .create-review-actions .button {
          min-height: 48px;
          justify-content: center;
          border-radius: 16px;
          font-weight: 950;
        }

        .create-review-error {
          margin-bottom: 1rem;
        }

        @media (min-width: 720px) {
          .create-review-card {
            padding: 1.25rem;
          }

          .create-review-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .create-review-field.full {
            grid-column: 1 / -1;
          }

          .create-review-ratings {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .create-review-actions {
            display: flex;
            flex-wrap: wrap;
          }
        }

        @media (min-width: 1040px) {
          .create-review-page {
            padding-bottom: 2rem;
          }

          .create-review-hero {
            padding: 2rem;
          }

          .create-review-layout {
            grid-template-columns: minmax(0, 1fr) 330px;
          }

          .create-review-card {
            padding: 1.4rem;
          }

          .create-review-side-card {
            position: sticky;
            top: 1rem;
            padding: 1.25rem;
          }
        }

        @media (max-width: 420px) {
          .create-review-hero {
            border-radius: 24px;
            padding: 1rem;
          }

          .create-review-card,
          .create-review-side-card {
            border-radius: 24px;
            padding: 0.85rem;
          }

          .create-review-section {
            border-radius: 20px;
            padding: 0.85rem;
          }

          .create-review-title {
            font-size: 2.1rem;
          }
        }
      `}</style>

      <section className="create-review-page">
        <div className="create-review-hero">
          <div className="create-review-badge">
            <span className="create-review-badge-dot"></span>
            New review
          </div>

          <h1 className="create-review-title">Create seller review</h1>

          <p className="create-review-subtitle">
            Share your experience with a seller, rate the product quality and
            price, and add a product link so other members can open it through
            Kakobuy.
          </p>
        </div>

        <div className="create-review-layout">
          <div className="create-review-card">
            {error && (
              <div className="alert alert-error create-review-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-review-form">
              <section className="create-review-section">
                <div className="create-review-section-header">
                  <h2>Seller details</h2>
                  <p>Start with the seller name, seller page and category.</p>
                </div>

                <div className="create-review-grid">
                  <div className="create-review-field">
                    <label htmlFor="seller_name">Seller name</label>
                    <input
                      id="seller_name"
                      name="seller_name"
                      type="text"
                      value={formData.seller_name}
                      onChange={handleChange}
                      placeholder="Example: TopSeller"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>

                  <div className="create-review-field">
                    <label htmlFor="seller_link">Seller link</label>
                    <input
                      id="seller_link"
                      name="seller_link"
                      type="url"
                      value={formData.seller_link}
                      onChange={handleChange}
                      placeholder="https://example.com/seller"
                      required
                    />
                  </div>

                  <div className="create-review-field full">
                    <label htmlFor="product_type">Product type</label>
                    <input
                      id="product_type"
                      name="product_type"
                      type="text"
                      value={formData.product_type}
                      onChange={handleChange}
                      placeholder="Example: sneakers, clothes, watches"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                </div>
              </section>

              <section className="create-review-section">
                <div className="create-review-section-header">
                  <h2>Ratings</h2>
                  <p>Rate the seller based on quality and price value.</p>
                </div>

                <div className="create-review-ratings">
                  <div className="create-review-rating-card">
                    <div className="create-review-rating-top">
                      <label htmlFor="quality_rating">Quality rating</label>
                      <span className="create-review-stars">
                        {"★".repeat(Number(formData.quality_rating))}
                      </span>
                    </div>

                    <select
                      id="quality_rating"
                      name="quality_rating"
                      value={formData.quality_rating}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1/5</option>
                      <option value="2">2/5</option>
                      <option value="3">3/5</option>
                      <option value="4">4/5</option>
                      <option value="5">5/5</option>
                    </select>
                  </div>

                  <div className="create-review-rating-card">
                    <div className="create-review-rating-top">
                      <label htmlFor="price_rating">Price rating</label>
                      <span className="create-review-stars">
                        {"★".repeat(Number(formData.price_rating))}
                      </span>
                    </div>

                    <select
                      id="price_rating"
                      name="price_rating"
                      value={formData.price_rating}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1/5</option>
                      <option value="2">2/5</option>
                      <option value="3">3/5</option>
                      <option value="4">4/5</option>
                      <option value="5">5/5</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="create-review-section">
                <div className="create-review-section-header">
                  <h2>Product details</h2>
                  <p>Add the product you bought from this seller.</p>
                </div>

                <div className="create-review-grid">
                  <div className="create-review-field">
                    <label htmlFor="product_name">Purchased product</label>
                    <input
                      id="product_name"
                      name="product_name"
                      type="text"
                      value={formData.product_name}
                      onChange={handleChange}
                      placeholder="Example: Nike TN Black"
                      required
                      minLength={2}
                      maxLength={150}
                    />
                  </div>

                  <div className="create-review-field">
                    <label htmlFor="purchase_date">Purchase date</label>
                    <input
                      id="purchase_date"
                      name="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="create-review-field full">
                    <label htmlFor="product_link">Product link</label>
                    <input
                      id="product_link"
                      name="product_link"
                      type="url"
                      value={formData.product_link}
                      onChange={handleChange}
                      placeholder="Weidian, Taobao, Tmall, 1688 or agent product link"
                      maxLength={2000}
                    />
                    <small>
                      Supported links are converted into Kakobuy buttons after
                      the review is created.
                    </small>
                  </div>

                  <div className="create-review-field full">
                    <label htmlFor="short_description">
                      Product description
                    </label>
                    <textarea
                      id="short_description"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleChange}
                      placeholder="Short info about the specific product you bought..."
                      rows="3"
                      maxLength={500}
                    />
                  </div>
                </div>
              </section>

              <section className="create-review-section">
                <div className="create-review-section-header">
                  <h2>Your experience</h2>
                  <p>Explain what made this seller good or bad.</p>
                </div>

                <div className="create-review-field">
                  <label htmlFor="description">Seller description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="How was the communication, delivery, reliability..."
                    rows="4"
                    maxLength={1000}
                  />
                </div>
              </section>

              <div className="create-review-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create review"}
                </button>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => navigate("/seller-reviews")}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <aside className="create-review-side-card">
            <h2>Before publishing</h2>

            <div className="create-review-checklist">
              <div className="create-review-check-item">
                <span className="create-review-check-icon">1</span>
                <span>Use a clear seller name so members can search it.</span>
              </div>

              <div className="create-review-check-item">
                <span className="create-review-check-icon">2</span>
                <span>Add the original product link when possible.</span>
              </div>

              <div className="create-review-check-item">
                <span className="create-review-check-icon">3</span>
                <span>Keep the review honest and useful for buyers.</span>
              </div>
            </div>

            <div className="create-review-link-note">
              <strong>Kakobuy ready</strong>
              Product links from Weidian, Taobao, Tmall, 1688 and agent pages
              can be opened with Kakobuy after publishing.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default CreateSellerReviewPage;