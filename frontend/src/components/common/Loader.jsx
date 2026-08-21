function Loader({ text = "Loading data..." }) {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 my-3">
            <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted small fw-medium mt-3 mb-0">{text}</p>
        </div>
    );
}

export default Loader;