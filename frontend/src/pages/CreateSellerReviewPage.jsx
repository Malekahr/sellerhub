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
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create seller review</h1>
          <p className="page-subtitle">
            Add a seller review based on one product you bought.
          </p>
        </div>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="quality_rating">Quality rating</label>
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

            <div className="form-group">
              <label htmlFor="price_rating">Price rating</label>
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

            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="purchase_date">Purchase date</label>
              <input
                id="purchase_date"
                name="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
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
            </div>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="short_description">Product description</label>
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

          <div className="button-row">
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
    </section>
  );
}

export default CreateSellerReviewPage;