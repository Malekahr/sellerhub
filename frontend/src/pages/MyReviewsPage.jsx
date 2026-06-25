import { useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "../api/api.js";
import ReviewCard from "../components/ReviewCard.jsx";

function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  const [productEditFormData, setProductEditFormData] = useState({
    product_name: "",
    purchase_date: "",
    short_description: "",
  });

  const [activeImageProductId, setActiveImageProductId] = useState(null);
  const [imageLabel, setImageLabel] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImageProductId, setUploadingImageProductId] = useState(null);

  const [addingProductReviewId, setAddingProductReviewId] = useState(null);
  const [newProductFormData, setNewProductFormData] = useState({
    product_name: "",
    purchase_date: "",
    short_description: "",
  });

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    seller_name: "",
    seller_link: "",
    product_type: "",
    quality_rating: "5",
    price_rating: "5",
    description: "",
  });

  async function loadMyReviews() {
    setError("");
    setIsLoading(true);

    try {
      const data = await apiGet("/seller-reviews/my");
      setReviews(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(review) {
    setEditingReviewId(review.id);
    setError("");

    setEditFormData({
      seller_name: review.seller_name || "",
      seller_link: review.seller_link || "",
      product_type: review.product_type || "",
      quality_rating: String(review.quality_rating || 5),
      price_rating: String(review.price_rating || 5),
      description: review.description || "",
    });
  }

  function cancelEditing() {
    setEditingReviewId(null);
    setError("");
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleUpdateReview(event, reviewId) {
    event.preventDefault();

    setError("");

    try {
      const updatedReview = await apiPatch(`/seller-reviews/${reviewId}`, {
        seller_name: editFormData.seller_name.trim(),
        seller_link: editFormData.seller_link.trim(),
        product_type: editFormData.product_type.trim(),
        quality_rating: Number(editFormData.quality_rating),
        price_rating: Number(editFormData.price_rating),
        description: editFormData.description.trim(),
      });

      setReviews((previousReviews) =>
        previousReviews.map((review) =>
          review.id === reviewId ? updatedReview : review
        )
      );

      setEditingReviewId(null);
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeleteReview(reviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingReviewId(reviewId);

    try {
      await apiDelete(`/seller-reviews/${reviewId}`);

      setReviews((previousReviews) =>
        previousReviews.filter((review) => review.id !== reviewId)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingReviewId(null);
    }
  }

  async function handleDeleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingProductId(productId);

    try {
      await apiDelete(`/seller-reviews/products/${productId}`);

      setReviews((previousReviews) =>
        previousReviews.map((review) => ({
          ...review,
          products: review.products.filter(
            (product) => product.id !== productId
          ),
        }))
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingProductId(null);
    }
  }

  function startEditingProduct(product) {
    setEditingProductId(product.id);
    setError("");

    setProductEditFormData({
      product_name: product.product_name || "",
      purchase_date: product.purchase_date || "",
      short_description: product.short_description || "",
    });
  }

  function cancelEditingProduct() {
    setEditingProductId(null);
    setError("");
  }

  function handleProductEditChange(event) {
    const { name, value } = event.target;

    setProductEditFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleUpdateProduct(event, productId) {
    event.preventDefault();

    setError("");

    try {
      const updatedProduct = await apiPatch(
        `/seller-reviews/products/${productId}`,
        {
          product_name: productEditFormData.product_name.trim(),
          purchase_date: productEditFormData.purchase_date || null,
          short_description: productEditFormData.short_description.trim(),
        }
      );

      setReviews((previousReviews) =>
        previousReviews.map((review) => ({
          ...review,
          products: review.products.map((product) =>
            product.id === productId ? updatedProduct : product
          ),
        }))
      );

      setEditingProductId(null);
    } catch (error) {
      setError(error.message);
    }
  }

  function startAddingProduct(reviewId) {
    setAddingProductReviewId(reviewId);
    setError("");

    setNewProductFormData({
      product_name: "",
      purchase_date: "",
      short_description: "",
    });
  }

  function cancelAddingProduct() {
    setAddingProductReviewId(null);
    setError("");
  }

  function handleNewProductChange(event) {
    const { name, value } = event.target;

    setNewProductFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleAddProduct(event, reviewId) {
    event.preventDefault();

    setError("");

    try {
      const newProduct = await apiPost(`/seller-reviews/${reviewId}/products`, {
        product_name: newProductFormData.product_name.trim(),
        purchase_date: newProductFormData.purchase_date || null,
        short_description: newProductFormData.short_description.trim(),
      });

      setReviews((previousReviews) =>
        previousReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                products: [...review.products, newProduct],
              }
            : review
        )
      );

      setAddingProductReviewId(null);
    } catch (error) {
      setError(error.message);
    }
  }

  function startImageUpload(productId) {
    setActiveImageProductId(productId);
    setImageLabel("");
    setImageFile(null);
    setError("");
  }

  function cancelImageUpload() {
    setActiveImageProductId(null);
    setImageLabel("");
    setImageFile(null);
    setError("");
  }

  function handleImageFileChange(event) {
    const file = event.target.files[0];
    setImageFile(file || null);
  }

  async function handleUploadImage(event, productId) {
    event.preventDefault();

    if (!imageFile) {
      setError("Choose an image first.");
      return;
    }

    setError("");
    setUploadingImageProductId(productId);

    try {
      const formData = new FormData();

      if (imageLabel.trim()) {
        formData.append("image_label", imageLabel.trim());
      }

      formData.append("file", imageFile);

      const newImage = await apiUpload(
        `/seller-reviews/products/${productId}/images`,
        formData
      );

      setReviews((previousReviews) =>
        previousReviews.map((review) => ({
          ...review,
          products: review.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  images: [...(product.images || []), newImage],
                }
              : product
          ),
        }))
      );

      setActiveImageProductId(null);
      setImageLabel("");
      setImageFile(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploadingImageProductId(null);
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
    setDeletingImageId(imageId);

    try {
      await apiDelete(`/seller-reviews/images/${imageId}`);

      setReviews((previousReviews) =>
        previousReviews.map((review) => ({
          ...review,
          products: review.products.map((product) => ({
            ...product,
            images: (product.images || []).filter(
              (image) => image.id !== imageId
            ),
          })),
        }))
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingImageId(null);
    }
  }

  useEffect(() => {
    loadMyReviews();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">My reviews</h1>
          <p className="page-subtitle">
            Manage your own seller reviews, products, and product images.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isLoading ? (
        <div className="card loading-state">
          <p>Loading your reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="card empty-state">
          <h2>No reviews yet</h2>
          <p>Create your first seller review to start building your profile.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id}>
              {editingReviewId === review.id ? (
                <section className="card">
                  <h2>Edit review</h2>

                  <form
                    className="form"
                    onSubmit={(event) => handleUpdateReview(event, review.id)}
                  >
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor={`seller_name_${review.id}`}>
                          Seller name
                        </label>
                        <input
                          id={`seller_name_${review.id}`}
                          name="seller_name"
                          type="text"
                          value={editFormData.seller_name}
                          onChange={handleEditChange}
                          required
                          minLength={2}
                          maxLength={100}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`seller_link_${review.id}`}>
                          Seller link
                        </label>
                        <input
                          id={`seller_link_${review.id}`}
                          name="seller_link"
                          type="url"
                          value={editFormData.seller_link}
                          onChange={handleEditChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`product_type_${review.id}`}>
                          Product type
                        </label>
                        <input
                          id={`product_type_${review.id}`}
                          name="product_type"
                          type="text"
                          value={editFormData.product_type}
                          onChange={handleEditChange}
                          required
                          minLength={2}
                          maxLength={100}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`quality_rating_${review.id}`}>
                          Quality rating
                        </label>
                        <select
                          id={`quality_rating_${review.id}`}
                          name="quality_rating"
                          value={editFormData.quality_rating}
                          onChange={handleEditChange}
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
                        <label htmlFor={`price_rating_${review.id}`}>
                          Price rating
                        </label>
                        <select
                          id={`price_rating_${review.id}`}
                          name="price_rating"
                          value={editFormData.price_rating}
                          onChange={handleEditChange}
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

                    <div className="form-group">
                      <label htmlFor={`description_${review.id}`}>
                        Description
                      </label>
                      <textarea
                        id={`description_${review.id}`}
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        rows="4"
                        maxLength={1000}
                      />
                    </div>

                    <div className="button-row">
                      <button type="submit" className="button button-primary">
                        Save changes
                      </button>

                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              ) : (
                <>
                  <ReviewCard
                    review={review}
                    onDeleteProduct={handleDeleteProduct}
                    deletingProductId={deletingProductId}
                    onStartEditProduct={startEditingProduct}
                    editingProductId={editingProductId}
                    productEditFormData={productEditFormData}
                    onProductEditChange={handleProductEditChange}
                    onUpdateProduct={handleUpdateProduct}
                    onCancelEditProduct={cancelEditingProduct}
                    onStartImageUpload={startImageUpload}
                    activeImageProductId={activeImageProductId}
                    imageLabel={imageLabel}
                    imageFile={imageFile}
                    onImageLabelChange={(event) =>
                      setImageLabel(event.target.value)
                    }
                    onImageFileChange={handleImageFileChange}
                    onUploadImage={handleUploadImage}
                    onCancelImageUpload={cancelImageUpload}
                    uploadingImageProductId={uploadingImageProductId}
                    onDeleteImage={handleDeleteImage}
                    deletingImageId={deletingImageId}
                  >
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => startEditing(review)}
                    >
                      Edit review
                    </button>

                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => startAddingProduct(review.id)}
                    >
                      Add product
                    </button>

                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingReviewId === review.id}
                    >
                      {deletingReviewId === review.id
                        ? "Deleting..."
                        : "Delete review"}
                    </button>
                  </ReviewCard>

                  {addingProductReviewId === review.id && (
                    <section className="card product-add-card">
                      <h2>Add product</h2>

                      <form
                        className="form"
                        onSubmit={(event) => handleAddProduct(event, review.id)}
                      >
                        <div className="form-grid">
                          <div className="form-group">
                            <label htmlFor={`new_product_name_${review.id}`}>
                              Product name
                            </label>
                            <input
                              id={`new_product_name_${review.id}`}
                              name="product_name"
                              type="text"
                              value={newProductFormData.product_name}
                              onChange={handleNewProductChange}
                              required
                              minLength={2}
                              maxLength={150}
                              placeholder="Example: Nike TN Black"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor={`new_purchase_date_${review.id}`}>
                              Purchase date
                            </label>
                            <input
                              id={`new_purchase_date_${review.id}`}
                              name="purchase_date"
                              type="date"
                              value={newProductFormData.purchase_date}
                              onChange={handleNewProductChange}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label
                            htmlFor={`new_short_description_${review.id}`}
                          >
                            Short description
                          </label>
                          <textarea
                            id={`new_short_description_${review.id}`}
                            name="short_description"
                            value={newProductFormData.short_description}
                            onChange={handleNewProductChange}
                            rows="3"
                            maxLength={500}
                            placeholder="Short info about this product..."
                          />
                        </div>

                        <div className="button-row">
                          <button
                            type="submit"
                            className="button button-primary"
                          >
                            Save product
                          </button>

                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={cancelAddingProduct}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyReviewsPage;