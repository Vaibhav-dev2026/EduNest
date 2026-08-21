function Footer() {
    return (
        <footer className="footer mt-auto py-3 border-top border-secondary border-opacity-10 text-center text-md-start">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between text-muted small">
                <div>
                    &copy; {new Date().getFullYear()} <span className="fw-semibold text-dark">EduNest</span>. All Rights Reserved.
                </div>
                <div className="d-flex gap-3 mt-2 mt-md-0">
                    <span className="text-secondary">Privacy Policy</span>
                    <span className="text-secondary">&bull;</span>
                    <span className="text-secondary">Terms of Service</span>
                    <span className="text-secondary">&bull;</span>
                    <span className="text-secondary">Help Desk</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;