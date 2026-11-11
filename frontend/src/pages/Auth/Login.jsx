import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, setCurrentSession } from "../../services/authService";

import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo/logo.jpeg";

function Login() {
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const validationErrors = {};
        if (!loginData.email.trim()) {
            validationErrors.email = "Email is required";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(loginData.email)) {
            validationErrors.email = "Enter a valid email address";
        }
        if (!loginData.password.trim()) {
            validationErrors.password = "Password is required";
        } else if (loginData.password.length < 6) {
            validationErrors.password = "Minimum 6 characters required";
        }
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        try {
            const response = await login(loginData);
            setCurrentSession(response.token, response.user);

            if (response.user.role === "admin") navigate("/dashboard");
            else if (response.user.role === "teacher") navigate("/teacher/dashboard");
            else if (response.user.role === "student") navigate("/student/dashboard");
            else navigate("/login");
        } catch (error) {
            setErrors({ form: error.message || "Invalid email or password. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-4">
                <img src={logo} alt="EduNest Logo" width="90" className="mb-3 rounded-3 shadow-sm" />
                <h2 className="fw-bold mb-1" style={{ color: "var(--text-dark)" }}>EduNest</h2>
                <p className="text-muted small mb-0">Learn. Achieve. Inspire.</p>
            </div>

            <h5 className="text-center fw-semibold mb-4" style={{ color: "var(--text-dark)" }}>
                Sign in to your account
            </h5>

            {errors.form && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 rounded-3" role="alert">
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                    <span className="small">{errors.form}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="login-email">
                        Email Address
                    </label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            className={`form-control border-start-0 ps-0 ${errors.email ? "is-invalid" : ""}`}
                            placeholder="you@example.com"
                            value={loginData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <div className="invalid-feedback d-block small">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="login-password">
                        Password
                    </label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? "is-invalid" : ""}`}
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="input-group-text bg-white border-start-0"
                            onClick={() => setShowPassword(v => !v)}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                        </button>
                    </div>
                    {errors.password && <div className="invalid-feedback d-block small">{errors.password}</div>}
                </div>

                {/* Remember me + Forgot */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check mb-0">
                        <input className="form-check-input" type="checkbox" id="rememberMe" />
                        <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <Link to="/forgot-password" className="text-decoration-none small" style={{ color: "var(--primary)" }}>
                        Forgot password?
                    </Link>
                </div>

                {/* Submit */}
                <div className="d-grid mb-3">
                    <button
                        type="submit"
                        className="btn btn-primary py-2 fw-semibold"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing in…
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Sign In
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <span className="small text-muted">Don't have an account?</span>
                    <Link to="/signup" className="ms-1 text-decoration-none fw-semibold small" style={{ color: "var(--primary)" }}>
                        Sign Up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default Login;