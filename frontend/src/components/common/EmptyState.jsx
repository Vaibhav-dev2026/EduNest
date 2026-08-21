function EmptyState({
    title = "No Records Found",
    message = "There are no records available to show right now.",
    icon = "bi-inbox"
}) {
    return (
        <div className="text-center py-5 px-3">
            <div className="bg-light text-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: "64px", height: "64px", fontSize: "1.75rem" }}>
                <i className={`bi ${icon}`}></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">{title}</h6>
            <p className="text-muted small max-w-xs mx-auto mb-0" style={{ maxWidth: "320px" }}>
                {message}
            </p>
        </div>
    );
}

export default EmptyState;
