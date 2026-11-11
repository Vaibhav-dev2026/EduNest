function AuthLayout({ children }) {
    return (
        <div
            className="container-fluid min-vh-100 d-flex justify-content-center align-items-center py-4 px-3"
            style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Ambient Background Decorative Glass Spheres */}
            <div
                style={{
                    position: "absolute",
                    top: "-8%",
                    right: "-5%",
                    width: "380px",
                    height: "380px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.04) 60%, transparent 80%)",
                    pointerEvents: "none"
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-10%",
                    left: "-5%",
                    width: "420px",
                    height: "420px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(16, 185, 129, 0.03) 60%, transparent 80%)",
                    pointerEvents: "none"
                }}
            />

            <div
                className="card shadow-lg border-0 glass-card animate-fade-in"
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    borderRadius: "var(--radius-xl)",
                    position: "relative",
                    zIndex: 1
                }}
            >
                <div className="card-body p-4 p-sm-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
