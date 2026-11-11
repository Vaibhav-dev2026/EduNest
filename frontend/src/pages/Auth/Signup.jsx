import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";
import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo/logo.jpeg";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        email: "",
        gender: "",
        role: "student",
        password: "",
        confirmPassword: "",
        terms: false
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const validationErrors = {};
        if (!formData.fullName.trim()) validationErrors.fullName = "Full Name is required";
        if (!/^[0-9]{10}$/.test(formData.mobile)) validationErrors.mobile = "Enter a valid 10-digit mobile number";
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) validationErrors.email = "Enter a valid email address";
        if (!formData.gender) validationErrors.gender = "Please select your gender";
        if (formData.password.length < 6) validationErrors.password = "Minimum 6 characters required";
        if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = "Passwords do not match";
        if (!formData.terms) validationErrors.terms = "You must accept the Terms & Conditions";
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        try {
            await signup(formData);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setErrors({ form: error.message || "Failed to create account. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout>
                <div className="text-center py-4">
                    <div className="mb-4" style={{ fontSize: "3rem" }}>🎉</div>
                    <h4 className="fw-bold text-success mb-2">Account Created!</h4>
                    <p className="text-muted small">Redirecting you to the login page…</p>
                    <div className="spinner-border spinner-border-sm text-primary mt-2" role="status"></div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="text-center mb-4">
                <img src={logo} alt="EduNest" width="80" className="mb-3 rounded-3 shadow-sm" />
                <h2 className="fw-bold mb-1" style={{ color: "var(--text-dark)" }}>EduNest</h2>
                <p className="text-muted small mb-0">Learn. Achieve. Inspire.</p>
            </div>

            <h5 className="text-center fw-semibold mb-4" style={{ color: "var(--text-dark)" }}>
                Create your account
            </h5>

            {errors.form && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 rounded-3" role="alert">
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                    <span className="small">{errors.form}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="su-fullName">Full Name</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-person text-muted"></i>
                        </span>
                        <input
                            id="su-fullName"
                            type="text"
                            name="fullName"
                            className={`form-control border-start-0 ps-0 ${errors.fullName ? "is-invalid" : ""}`}
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.fullName && <div className="invalid-feedback d-block small">{errors.fullName}</div>}
                </div>

                {/* Mobile + Email row */}
                <div className="row g-3 mb-3">
                    <div className="col-6">
                        <label className="form-label fw-medium small" htmlFor="su-mobile">Mobile</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-phone text-muted"></i>
                            </span>
                            <input
                                id="su-mobile"
                                type="tel"
                                name="mobile"
                                className={`form-control border-start-0 ps-0 ${errors.mobile ? "is-invalid" : ""}`}
                                placeholder="10-digit number"
                                value={formData.mobile}
                                onChange={handleChange}
                                maxLength={10}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.mobile && <div className="invalid-feedback d-block small">{errors.mobile}</div>}
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-medium small" htmlFor="su-gender">Gender</label>
                        <select
                            id="su-gender"
                            className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="">Select…</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <div className="invalid-feedback d-block small">{errors.gender}</div>}
                    </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="su-email">Email Address</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input
                            id="su-email"
                            type="email"
                            name="email"
                            className={`form-control border-start-0 ps-0 ${errors.email ? "is-invalid" : ""}`}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <div className="invalid-feedback d-block small">{errors.email}</div>}
                </div>

                {/* Role */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="su-role">Role</label>
                    <select
                        id="su-role"
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={isLoading}
                    >
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="su-password">Password</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                            id="su-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? "is-invalid" : ""}`}
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="input-group-text bg-white border-start-0"
                            onClick={() => setShowPassword(v => !v)}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                        </button>
                    </div>
                    {errors.password && <div className="invalid-feedback d-block small">{errors.password}</div>}
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                    <label className="form-label fw-medium small" htmlFor="su-confirmPassword">Confirm Password</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-lock-fill text-muted"></i>
                        </span>
                        <input
                            id="su-confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            className={`form-control border-start-0 border-end-0 ps-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                            placeholder="Repeat password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="input-group-text bg-white border-start-0"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide" : "Show"}
                        >
                            <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                        </button>
                    </div>
                    {errors.confirmPassword && <div className="invalid-feedback d-block small">{errors.confirmPassword}</div>}
                </div>

                {/* Terms */}
                <div className="form-check mb-4">
                    <input
                        type="checkbox"
                        className={`form-check-input ${errors.terms ? "is-invalid" : ""}`}
                        id="terms"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <label className="form-check-label small" htmlFor="terms">
                        I agree to the{" "}
                        <span className="fw-semibold" style={{ color: "var(--primary)" }}>Terms &amp; Conditions</span>
                    </label>
                    {errors.terms && <div className="invalid-feedback d-block small">{errors.terms}</div>}
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
                                Creating account…
                            </>
                        ) : (
                            <>
                                <i className="bi bi-person-plus-fill me-2"></i>
                                Create Account
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <span className="small text-muted">Already have an account?</span>
                    <Link to="/login" className="ms-1 text-decoration-none fw-semibold small" style={{ color: "var(--primary)" }}>
                        Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default Signup;