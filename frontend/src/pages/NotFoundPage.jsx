import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="card">
      <h1>404</h1>
      <p className="text-soft">The page you are looking for does not exist.</p>

      <div className="cluster" style={{ marginTop: "1rem" }}>
        <Link to="/seller-reviews" className="button button-primary">
          Go to seller reviews
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;