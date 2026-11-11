function Modal({
    id,
    title,
    children
}) {
    return (
        <div
            className="modal fade"
            id={id}
            tabIndex="-1"
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "var(--radius-lg)" }}>
                    <div className="modal-header border-bottom border-secondary border-opacity-10 px-4 py-3">
                        <h5 className="modal-title fw-bold text-dark fs-5" id={`${id}Label`}>{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className="modal-body p-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
