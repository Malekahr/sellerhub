import { useState } from "react";
import { getUploadUrl } from "../api/api.js";

function RatingStars({ label, value }) {
  const rating = Number(value) || 0;
  const roundedRating = Math.round(rating);
  const stars = "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);

  return (
    <div className="review-rating">
      <span className="review-rating-label">{label}</span>
      <span
        className="review-rating-stars"
        aria-label={`${label}: ${rating} out of 5`}
      >
        {stars}
      </span>
      <span className="review-rating-score">{rating}/5</span>
    </div>
  );
}

function ReviewCard({
  review,
  children,
  onDeleteProduct,
  deletingProductId,
  onStartEditProduct,
  editingProductId,
  productEditFormData,
  onProductEditChange,
  onUpdateProduct,
  onCancelEditProduct,
  onStartImageUpload,
  activeImageProductId,
  imageLabel,
  onImageLabelChange,
  onImageFileChange,
  onUploadImage,
  onCancelImageUpload,
  uploadingImageProductId,
  onDeleteImage,
  deletingImageId,
}) {
  const [expandedImagesByProductId, setExpandedImagesByProductId] = useState({});

  const products = review.products || [];

  function toggleProductImages(productId) {
    setExpandedImagesByProductId((currentState) => ({
      ...currentState,
      [productId]: !currentState[productId],
    }));
  }

  return (
    <article className="review-card marketplace-review-card">
      <header className="review-card-header">
        <div className="review-seller-main">
          <span className="badge badge-muted">{review.product_type}</span>

          <h2 className="review-seller-name">{review.seller_name}</h2>

          {review.description && (
            <p className="review-description">{review.description}</p>
          )}
        </div>

        <div className="review-side-panel">
          <div className="review-ratings">
            <RatingStars label="Quality" value={review.quality_rating} />
            <RatingStars label="Price" value={review.price_rating} />
          </div>

          {review.seller_link && (
            <a
              href={review.seller_link}
              className="btn btn-primary btn-full"
              target="_blank"
              rel="noreferrer"
            >
              Open seller
            </a>
          )}
        </div>
      </header>

      <section className="review-products">
        <div className="review-section-header">
          <h3>Products</h3>
          <span className="badge badge-accent">
            {products.length} product(s)
          </span>
        </div>

        {products.length === 0 ? (
          <p className="empty-state">No products added.</p>
        ) : (
          <div className="product-list">
            {products.map((product) => {
              const productImages = product.images || [];
              const imagePreviewLimit = 3;
              const imagesAreExpanded = Boolean(
                expandedImagesByProductId[product.id]
              );

              const imagesToShow = imagesAreExpanded
                ? productImages
                : productImages.slice(0, imagePreviewLimit);

              const hiddenImageCount = productImages.length - imagePreviewLimit;

              return (
                <div key={product.id} className="product-item">
                  {editingProductId === product.id ? (
                    <form
                      className="product-edit-form card"
                      onSubmit={(event) => onUpdateProduct(event, product.id)}
                    >
                      <div className="form-grid">
                        <div>
                          <label htmlFor={`product_name_${product.id}`}>
                            Product name
                          </label>
                          <input
                            id={`product_name_${product.id}`}
                            name="product_name"
                            type="text"
                            value={productEditFormData.product_name}
                            onChange={onProductEditChange}
                            required
                            minLength={2}
                            maxLength={150}
                          />
                        </div>

                        <div>
                          <label htmlFor={`purchase_date_${product.id}`}>
                            Purchase date
                          </label>
                          <input
                            id={`purchase_date_${product.id}`}
                            name="purchase_date"
                            type="date"
                            value={productEditFormData.purchase_date}
                            onChange={onProductEditChange}
                          />
                        </div>

                        <div>
                          <label htmlFor={`short_description_${product.id}`}>
                            Short description
                          </label>
                          <textarea
                            id={`short_description_${product.id}`}
                            name="short_description"
                            value={productEditFormData.short_description}
                            onChange={onProductEditChange}
                            rows="3"
                            maxLength={500}
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-small">
                          Save product
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={onCancelEditProduct}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="product-content">
                      <div className="product-main">
                        <div className="product-topline">
                          <strong className="product-name">
                            {product.product_name}
                          </strong>

                          {product.purchase_date && (
                            <span className="badge badge-muted">
                              {product.purchase_date}
                            </span>
                          )}
                        </div>

                        {product.short_description && (
                          <p className="product-description">
                            {product.short_description}
                          </p>
                        )}

                        {productImages.length > 0 && (
                          <div className="product-images-panel">
                            <div className="product-images">
                              {imagesToShow.map((image) => (
                                <div key={image.id} className="product-image-card">
                                  <img
                                    src={getUploadUrl(image.file_path)}
                                    alt={image.image_label || product.product_name}
                                  />

                                  {image.image_label && (
                                    <p className="image-label">
                                      {image.image_label}
                                    </p>
                                  )}

                                  {onDeleteImage && (
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-small image-delete-button"
                                      onClick={() => onDeleteImage(image.id)}
                                      disabled={deletingImageId === image.id}
                                    >
                                      {deletingImageId === image.id
                                        ? "Deleting..."
                                        : "Delete image"}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {productImages.length > imagePreviewLimit && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => toggleProductImages(product.id)}
                              >
                                {imagesAreExpanded
                                  ? "Show less pictures"
                                  : `See more pictures (+${hiddenImageCount})`}
                              </button>
                            )}
                          </div>
                        )}

                        {activeImageProductId === product.id && (
                          <form
                            className="image-upload-form card"
                            onSubmit={(event) => onUploadImage(event, product.id)}
                          >
                            <div className="form-grid">
                              <div>
                                <label htmlFor={`image_label_${product.id}`}>
                                  Image label
                                </label>
                                <input
                                  id={`image_label_${product.id}`}
                                  type="text"
                                  value={imageLabel}
                                  onChange={onImageLabelChange}
                                  placeholder="Example: front, box, detail"
                                  maxLength={100}
                                />
                              </div>

                              <div>
                                <label htmlFor={`image_file_${product.id}`}>
                                  Image
                                </label>
                                <input
                                  id={`image_file_${product.id}`}
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={onImageFileChange}
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-actions">
                              <button
                                type="submit"
                                className="btn btn-primary btn-small"
                                disabled={uploadingImageProductId === product.id}
                              >
                                {uploadingImageProductId === product.id
                                  ? "Uploading..."
                                  : "Upload image"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={onCancelImageUpload}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {(onDeleteProduct ||
                        onStartEditProduct ||
                        onStartImageUpload) && (
                        <div className="product-actions">
                          {onStartEditProduct && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => onStartEditProduct(product)}
                            >
                              Edit product
                            </button>
                          )}

                          {onStartImageUpload && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => onStartImageUpload(product.id)}
                            >
                              Add image
                            </button>
                          )}

                          {onDeleteProduct && (
                            <button
                              type="button"
                              className="btn btn-danger btn-small"
                              onClick={() => onDeleteProduct(product.id)}
                              disabled={deletingProductId === product.id}
                            >
                              {deletingProductId === product.id
                                ? "Deleting..."
                                : "Delete product"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {children && <div className="review-card-actions">{children}</div>}
    </article>
  );
}

export default ReviewCard;