import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiPost, apiUpload } from "../api/api.js";

const PRODUCT_TYPE_OPTIONS = [
  "Shoes",
  "Clothing",
  "Bags",
  "Watches",
  "Jewelry",
  "Accessories",
  "Electronics",
  "Other",
];

const MAX_PRODUCTS_PER_REVIEW = 5;
const MAX_IMAGES_PER_PRODUCT = 6;

function createClientId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptyProduct() {
  return {
    clientId: createClientId(),
    product_name: "",
    purchase_date: "",
    short_description: "",
    product_link: "",
    images: [],
  };
}

function CreateSellerReviewPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    seller_name: "",
    seller_link: "",
    product_type: "",
    seller_specialties: "",
    quality_rating: "5",
    price_rating: "5",
    description: "",
  });

  const [products, setProducts] = useState([createEmptyProduct()]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleProductChange(productClientId, event) {
    const { name, value } = event.target;

    setProducts((previousProducts) =>
      previousProducts.map((product) =>
        product.clientId === productClientId
          ? {
              ...product,
              [name]: value,
            }
          : product
      )
    );
  }

  function handleAddProduct() {
    setError("");

    if (products.length >= MAX_PRODUCTS_PER_REVIEW) {
      setError(`You can add up to ${MAX_PRODUCTS_PER_REVIEW} products.`);
      return;
    }

    setProducts((previousProducts) => [
      ...previousProducts,
      createEmptyProduct(),
    ]);
  }

  function handleRemoveProduct(productClientId) {
    setError("");

    setProducts((previousProducts) => {
      if (previousProducts.length === 1) {
        return previousProducts;
      }

      return previousProducts.filter(
        (product) => product.clientId !== productClientId
      );
    });
  }

  function handleProductImagesChange(productClientId, event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");

    setProducts((previousProducts) =>
      previousProducts.map((product) => {
        if (product.clientId !== productClientId) {
          return product;
        }

        const availableSlots = MAX_IMAGES_PER_PRODUCT - product.images.length;
        const filesToAdd = selectedFiles.slice(0, availableSlots);

        if (filesToAdd.length < selectedFiles.length) {
          setError(
            `Each product can have up to ${MAX_IMAGES_PER_PRODUCT} images. Extra images were ignored.`
          );
        }

        const newImages = filesToAdd.map((file) => ({
          clientId: createClientId(),
          file,
          image_label: "",
        }));

        return {
          ...product,
          images: [...product.images, ...newImages],
        };
      })
    );

    event.target.value = "";
  }

  function handleProductImageLabelChange(productClientId, imageClientId, event) {
    const { value } = event.target;

    setProducts((previousProducts) =>
      previousProducts.map((product) => {
        if (product.clientId !== productClientId) {
          return product;
        }

        return {
          ...product,
          images: product.images.map((image) =>
            image.clientId === imageClientId
              ? {
                  ...image,
                  image_label: value,
                }
              : image
          ),
        };
      })
    );
  }

  function handleRemoveProductImage(productClientId, imageClientId) {
    setError("");

    setProducts((previousProducts) =>
      previousProducts.map((product) => {
        if (product.clientId !== productClientId) {
          return product;
        }

        return {
          ...product,
          images: product.images.filter(
            (image) => image.clientId !== imageClientId
          ),
        };
      })
    );
  }

  async function uploadImagesForCreatedProducts(createdProducts) {
    const uploadErrors = [];

    for (let productIndex = 0; productIndex < products.length; productIndex += 1) {
      const localProduct = products[productIndex];
      const createdProduct = createdProducts[productIndex];

      if (!createdProduct?.id) {
        if (localProduct.images.length > 0) {
          uploadErrors.push(localProduct.product_name || `Product ${productIndex + 1}`);
        }

        continue;
      }

      for (const image of localProduct.images) {
        try {
          const imageFormData = new FormData();

          if (image.image_label.trim()) {
            imageFormData.append("image_label", image.image_label.trim());
          }

          imageFormData.append("file", image.file);

          await apiUpload(
            `/seller-reviews/products/${createdProduct.id}/images`,
            imageFormData
          );
        } catch {
          uploadErrors.push(localProduct.product_name || `Product ${productIndex + 1}`);
        }
      }
    }

    return uploadErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const cleanedProducts = products.map((product) => ({
      product_name: product.product_name.trim(),
      purchase_date: product.purchase_date || null,
      short_description: product.short_description.trim(),
      product_link: product.product_link.trim() || null,
    }));

    try {
      const createdReview = await apiPost("/seller-reviews", {
        seller_name: formData.seller_name.trim(),
        seller_link: formData.seller_link.trim(),
        product_type: formData.product_type.trim(),
        seller_specialties: formData.seller_specialties.trim() || null,
        quality_rating: Number(formData.quality_rating),
        price_rating: Number(formData.price_rating),
        description: formData.description.trim(),
        products: cleanedProducts,
      });

      const uploadErrors = await uploadImagesForCreatedProducts(
        createdReview.products || []
      );

      if (uploadErrors.length > 0) {
        window.alert(
          "Review created, but some images could not be uploaded. You can add them later from My Reviews."
        );
      }

      navigate(`/seller-reviews/${createdReview.id}`);
    } catch (error) {
      setError(error.message);
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

        .create-review-section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
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

        .create-product-card {
          display: grid;
          gap: 0.95rem;
          border: 1px solid rgba(45, 38, 30, 0.12);
          border-radius: 22px;
          padding: 1rem;
          background: rgba(255, 250, 242, 0.72);
        }

        .create-product-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }

        .create-product-card-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #1f1c18;
          font-weight: 950;
        }

        .create-product-number {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: #1f1c18;
          color: #fffaf2;
          font-size: 0.82rem;
          font-weight: 950;
        }

        .create-product-images-panel {
          display: grid;
          gap: 0.8rem;
          border: 1px dashed rgba(45, 38, 30, 0.2);
          border-radius: 20px;
          padding: 0.9rem;
          background: rgba(255, 255, 255, 0.58);
        }

        .create-product-images-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .create-product-images-top strong {
          display: block;
          color: #1f1c18;
          font-size: 0.95rem;
        }

        .create-product-images-top small {
          display: block;
          margin-top: 0.2rem;
          color: #82786d;
          font-size: 0.78rem;
          line-height: 1.4;
        }

        .create-image-picker {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 14px;
          padding: 0.7rem 0.95rem;
          background: #1f1c18;
          color: #fffaf2;
          font-size: 0.86rem;
          font-weight: 950;
          cursor: pointer;
          white-space: nowrap;
        }

        .create-image-picker input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .create-selected-images {
          display: grid;
          gap: 0.65rem;
        }

        .create-selected-image-item {
          display: grid;
          gap: 0.65rem;
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 18px;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.8);
        }

        .create-selected-image-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }

        .create-selected-image-name {
          min-width: 0;
          color: #2d271f;
          font-size: 0.86rem;
          font-weight: 900;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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

          .create-selected-image-item {
            grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
            align-items: center;
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

          .create-review-section-header-row,
          .create-product-images-top,
          .create-product-card-header {
            display: grid;
          }

          .create-image-picker {
            width: 100%;
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
            price, and add multiple products with images so other members can
            judge the seller better.
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
                  <p>Start with the seller name, seller page, category and what they sell.</p>
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

                  <div className="create-review-field">
                    <label htmlFor="product_type">Product category</label>
                    <select
                      id="product_type"
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose a category</option>
                      {PRODUCT_TYPE_OPTIONS.map((productType) => (
                        <option key={productType} value={productType}>
                          {productType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="create-review-field">
                    <label htmlFor="seller_specialties">Brands / styles sold</label>
                    <input
                      id="seller_specialties"
                      name="seller_specialties"
                      type="text"
                      value={formData.seller_specialties}
                      onChange={handleChange}
                      placeholder="Example: Nike, Adidas, New Balance, streetwear"
                      maxLength={300}
                    />
                    <small>
                      Show what this seller is known for on the Explore page.
                    </small>
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
                <div className="create-review-section-header create-review-section-header-row">
                  <div>
                    <h2>Products</h2>
                    <p>Add up to 5 products and up to 6 images per product.</p>
                  </div>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleAddProduct}
                    disabled={isLoading || products.length >= MAX_PRODUCTS_PER_REVIEW}
                  >
                    Add product
                  </button>
                </div>

                {products.map((product, productIndex) => (
                  <div key={product.clientId} className="create-product-card">
                    <div className="create-product-card-header">
                      <div className="create-product-card-title">
                        <span className="create-product-number">
                          {productIndex + 1}
                        </span>
                        <span>Product {productIndex + 1}</span>
                      </div>

                      {products.length > 1 && (
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => handleRemoveProduct(product.clientId)}
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="create-review-grid">
                      <div className="create-review-field">
                        <label htmlFor={`product_name_${product.clientId}`}>
                          Purchased product
                        </label>
                        <input
                          id={`product_name_${product.clientId}`}
                          name="product_name"
                          type="text"
                          value={product.product_name}
                          onChange={(event) =>
                            handleProductChange(product.clientId, event)
                          }
                          placeholder="Example: Nike TN Black"
                          required
                          minLength={2}
                          maxLength={150}
                        />
                      </div>

                      <div className="create-review-field">
                        <label htmlFor={`purchase_date_${product.clientId}`}>
                          Purchase date
                        </label>
                        <input
                          id={`purchase_date_${product.clientId}`}
                          name="purchase_date"
                          type="date"
                          value={product.purchase_date}
                          onChange={(event) =>
                            handleProductChange(product.clientId, event)
                          }
                        />
                      </div>

                      <div className="create-review-field full">
                        <label htmlFor={`product_link_${product.clientId}`}>
                          Product link
                        </label>
                        <input
                          id={`product_link_${product.clientId}`}
                          name="product_link"
                          type="url"
                          value={product.product_link}
                          onChange={(event) =>
                            handleProductChange(product.clientId, event)
                          }
                          placeholder="Weidian, Taobao, Tmall, 1688 or agent product link"
                          maxLength={2000}
                        />
                        <small>
                          Supported links are converted into agent buttons after
                          the review is created.
                        </small>
                      </div>

                      <div className="create-review-field full">
                        <label htmlFor={`short_description_${product.clientId}`}>
                          Product description
                        </label>
                        <textarea
                          id={`short_description_${product.clientId}`}
                          name="short_description"
                          value={product.short_description}
                          onChange={(event) =>
                            handleProductChange(product.clientId, event)
                          }
                          placeholder="Short info about the specific product you bought..."
                          rows="3"
                          maxLength={500}
                        />
                      </div>
                    </div>

                    <div className="create-product-images-panel">
                      <div className="create-product-images-top">
                        <div>
                          <strong>Product images</strong>
                          <small>
                            Add real product, QC, box or detail pictures.
                          </small>
                        </div>

                        <label className="create-image-picker">
                          Add images
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(event) =>
                              handleProductImagesChange(product.clientId, event)
                            }
                            disabled={
                              isLoading ||
                              product.images.length >= MAX_IMAGES_PER_PRODUCT
                            }
                          />
                        </label>
                      </div>

                      {product.images.length === 0 ? (
                        <p className="empty-state">No images selected.</p>
                      ) : (
                        <div className="create-selected-images">
                          {product.images.map((image) => (
                            <div
                              key={image.clientId}
                              className="create-selected-image-item"
                            >
                              <div className="create-selected-image-meta">
                                <span className="create-selected-image-name">
                                  {image.file.name}
                                </span>

                                <button
                                  type="button"
                                  className="button button-danger"
                                  onClick={() =>
                                    handleRemoveProductImage(
                                      product.clientId,
                                      image.clientId
                                    )
                                  }
                                  disabled={isLoading}
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="create-review-field">
                                <label
                                  htmlFor={`image_label_${product.clientId}_${image.clientId}`}
                                >
                                  Image label
                                </label>
                                <input
                                  id={`image_label_${product.clientId}_${image.clientId}`}
                                  type="text"
                                  value={image.image_label}
                                  onChange={(event) =>
                                    handleProductImageLabelChange(
                                      product.clientId,
                                      image.clientId,
                                      event
                                    )
                                  }
                                  placeholder="Example: front, box, detail"
                                  maxLength={100}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                  {isLoading ? "Creating and uploading..." : "Create review"}
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
                <span>Add multiple products if you bought more than one item.</span>
              </div>

              <div className="create-review-check-item">
                <span className="create-review-check-icon">3</span>
                <span>Add images for every product when possible.</span>
              </div>
            </div>

            <div className="create-review-link-note">
              <strong>Image upload ready</strong>
              The review is created first. After that, your selected images are
              uploaded automatically to the right product.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default CreateSellerReviewPage;