function GroupCard({ group, children }) {
  const groupInitial = group.name?.charAt(0).toUpperCase() || "G";

  return (
    <article className="group-card community-group-card">
      <div className="group-card-main">
        <div className="group-avatar" aria-hidden="true">
          {groupInitial}
        </div>

        <div className="group-content">
          <div className="group-card-header">
            <div>
              <h2 className="group-name">{group.name}</h2>

              {group.description ? (
                <p className="group-description">{group.description}</p>
              ) : (
                <p className="group-description">
                  Geen beschrijving toegevoegd.
                </p>
              )}
            </div>

            <span
              className={
                group.is_private
                  ? "badge badge-private"
                  : "badge badge-public"
              }
            >
              {group.is_private ? "Private" : "Public"}
            </span>
          </div>

          <div className="group-meta">
            <span>Community group</span>
          </div>
        </div>
      </div>

      {children && <div className="group-card-actions">{children}</div>}
    </article>
  );
}

export default GroupCard;