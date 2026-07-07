import { Link } from "react-router-dom";

function GroupsPage() {
  return (
    <>
      <style>{`
        .groups-coming-soon {
          width: 100%;
          min-height: calc(100dvh - 90px);
          padding: 1rem;
          padding-bottom: 6rem;
        }

        .groups-coming-card {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 26px;
          padding: 1.1rem;
          background:
            radial-gradient(circle at top left, rgba(255, 190, 92, 0.42), transparent 34%),
            radial-gradient(circle at bottom right, rgba(45, 38, 30, 0.1), transparent 32%),
            #fffaf2;
          box-shadow: 0 18px 50px rgba(47, 38, 28, 0.12);
          overflow: hidden;
        }

        .groups-coming-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.4rem;
        }

        .groups-coming-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
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

        .groups-coming-dot {
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 999px;
          background: #ffb84d;
          box-shadow: 0 0 0 6px rgba(255, 184, 77, 0.18);
        }

        .groups-coming-lock {
          border-radius: 999px;
          padding: 0.5rem 0.7rem;
          background: #1f1c18;
          color: #fffaf2;
          font-size: 0.72rem;
          font-weight: 900;
          white-space: nowrap;
        }

        .groups-coming-layout {
          display: grid;
          gap: 1.25rem;
        }

        .groups-coming-eyebrow {
          margin: 0 0 0.65rem;
          color: #b17b2c;
          font-size: 0.76rem;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .groups-coming-title {
          max-width: 720px;
          margin: 0;
          color: #1f1c18;
          font-size: clamp(2.25rem, 13vw, 4.9rem);
          line-height: 0.92;
          letter-spacing: -0.07em;
        }

        .groups-coming-subtitle {
          max-width: 650px;
          margin: 1rem 0 0;
          color: #6b6258;
          font-size: 0.98rem;
          line-height: 1.65;
        }

        .groups-coming-actions {
          display: grid;
          gap: 0.7rem;
          margin-top: 1.35rem;
        }

        .groups-coming-button {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          padding: 0.85rem 1rem;
          text-decoration: none;
          font-weight: 900;
          text-align: center;
        }

        .groups-coming-button.primary {
          background: #1f1c18;
          color: #fffaf2;
          box-shadow: 0 14px 30px rgba(31, 28, 24, 0.18);
        }

        .groups-coming-button.secondary {
          border: 1px solid rgba(45, 38, 30, 0.14);
          background: rgba(255, 255, 255, 0.68);
          color: #1f1c18;
        }

        .groups-preview-panel {
          border: 1px solid rgba(45, 38, 30, 0.1);
          border-radius: 22px;
          padding: 0.9rem;
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(14px);
        }

        .groups-preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
          color: #6b6258;
          font-size: 0.78rem;
          font-weight: 900;
        }

        .groups-preview-small-dot {
          width: 0.52rem;
          height: 0.52rem;
          border-radius: 999px;
          background: #1f1c18;
        }

        .groups-preview-card {
          display: flex;
          gap: 0.8rem;
          border-radius: 18px;
          padding: 0.9rem;
          background: #fffaf2;
          box-shadow: 0 12px 28px rgba(47, 38, 28, 0.1);
        }

        .groups-preview-avatar {
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #1f1c18;
          color: #fffaf2;
          font-weight: 950;
        }

        .groups-preview-title {
          margin: 0 0 0.3rem;
          color: #1f1c18;
          font-size: 1rem;
        }

        .groups-preview-text {
          margin: 0;
          color: #746a60;
          line-height: 1.45;
          font-size: 0.88rem;
        }

        .groups-preview-lines {
          display: grid;
          gap: 0.6rem;
          margin-top: 0.9rem;
        }

        .groups-preview-line {
          height: 13px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(45, 38, 30, 0.1),
            rgba(45, 38, 30, 0.04)
          );
        }

        .groups-feature-grid {
          display: grid;
          gap: 0.8rem;
          margin-top: 1.25rem;
        }

        .groups-feature-card {
          border: 1px solid rgba(45, 38, 30, 0.09);
          border-radius: 20px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.62);
        }

        .groups-feature-number {
          display: inline-flex;
          margin-bottom: 0.65rem;
          color: #b17b2c;
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .groups-feature-title {
          margin: 0;
          color: #1f1c18;
          font-size: 1rem;
        }

        .groups-feature-text {
          margin: 0.45rem 0 0;
          color: #6f665c;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .groups-release-note {
          margin-top: 0.9rem;
          border: 1px dashed rgba(45, 38, 30, 0.22);
          border-radius: 20px;
          padding: 0.95rem;
          background: rgba(255, 255, 255, 0.55);
          color: #746a60;
          line-height: 1.5;
          font-size: 0.92rem;
        }

        .groups-release-note strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #1f1c18;
        }

        .groups-release-note p {
          margin: 0;
        }

        @media (min-width: 640px) {
          .groups-coming-soon {
            padding: 1.5rem;
            padding-bottom: 2rem;
          }

          .groups-coming-card {
            border-radius: 32px;
            padding: 2rem;
          }

          .groups-coming-actions {
            display: flex;
            flex-wrap: wrap;
          }

          .groups-coming-button {
            width: auto;
          }

          .groups-feature-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 960px) {
          .groups-coming-soon {
            min-height: calc(100dvh - 2rem);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .groups-coming-card {
            padding: 3rem;
          }

          .groups-coming-layout {
            grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
            gap: 3rem;
            align-items: center;
          }

          .groups-coming-subtitle {
            font-size: 1.08rem;
          }
        }

        @media (max-width: 380px) {
          .groups-coming-soon {
            padding: 0.75rem;
            padding-bottom: 5.75rem;
          }

          .groups-coming-card {
            border-radius: 22px;
            padding: 0.9rem;
          }

          .groups-coming-title {
            font-size: 2rem;
          }

          .groups-preview-card {
            flex-direction: column;
          }

          .groups-coming-lock {
            font-size: 0.68rem;
          }
        }
      `}</style>

      <section className="groups-coming-soon">
        <div className="groups-coming-card">
          <div className="groups-coming-top">
            <div className="groups-coming-badge">
              <span className="groups-coming-dot"></span>
              Coming soon
            </div>

            <div className="groups-coming-lock">Preview locked</div>
          </div>

          <div className="groups-coming-layout">
            <div>
              <p className="groups-coming-eyebrow">SellerHub Community</p>

              <h1 className="groups-coming-title">
                Groups are being prepared.
              </h1>

              <p className="groups-coming-subtitle">
                A new way to build private communities, share trusted seller
                finds, and collect product reviews together is coming to
                SellerHub.
              </p>

              <div className="groups-coming-actions">
                <Link
                  to="/seller-reviews"
                  className="groups-coming-button primary"
                >
                  Browse reviews
                </Link>

                <Link
                  to="/seller-reviews/create"
                  className="groups-coming-button secondary"
                >
                  Create review
                </Link>
              </div>
            </div>

            <div className="groups-preview-panel">
              <div className="groups-preview-header">
                <span className="groups-preview-small-dot"></span>
                Group preview
              </div>

              <div className="groups-preview-card">
                <div className="groups-preview-avatar">SF</div>

                <div>
                  <h3 className="groups-preview-title">Sneaker Finds</h3>
                  <p className="groups-preview-text">
                    Members, shared links, review collections and trusted seller
                    drops.
                  </p>
                </div>
              </div>

              <div className="groups-preview-lines">
                <div className="groups-preview-line"></div>
                <div
                  className="groups-preview-line"
                  style={{ width: "82%" }}
                ></div>
                <div
                  className="groups-preview-line"
                  style={{ width: "64%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="groups-feature-grid">
            <article className="groups-feature-card">
              <span className="groups-feature-number">01</span>
              <h3 className="groups-feature-title">Private communities</h3>
              <p className="groups-feature-text">
                Create focused spaces around sellers, niches or product types.
              </p>
            </article>

            <article className="groups-feature-card">
              <span className="groups-feature-number">02</span>
              <h3 className="groups-feature-title">Shared finds</h3>
              <p className="groups-feature-text">
                Collect useful product links and reviews in one clean overview.
              </p>
            </article>

            <article className="groups-feature-card">
              <span className="groups-feature-number">03</span>
              <h3 className="groups-feature-title">Trusted members</h3>
              <p className="groups-feature-text">
                Build groups around people who actually contribute value.
              </p>
            </article>
          </div>

          <div className="groups-release-note">
            <strong>Release note</strong>
            <p>
              Groups are currently hidden from the public release while the
              feature is being polished. Reviews, products and Kakobuy links
              remain available.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default GroupsPage;