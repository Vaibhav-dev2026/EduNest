import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
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

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((previousData) => ({
            ...previousData,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const validateForm = () => {
        let validationErrors = {};
        if (formData.fullName.trim() === "") {
            validationErrors.fullName = "Full Name is required";
        }
        if (!/^[0-9]{10}$/.test(formData.mobile)) {
            validationErrors.mobile = "Enter valid 10 digit Mobile Number";
        }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            validationErrors.email = "Enter valid Email";
        }
        if (formData.gender === "") {
            validationErrors.gender = "Select Gender";
        }
        if (formData.password.length < 6) {
            validationErrors.password = "Minimum 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = "Passwords do not match";
        }
        if (!formData.terms) {
            validationErrors.terms = "Accept Terms & Conditions";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateForm()) {
            try {
                await signup(formData);
                alert("Account created successfully! 🎉 Now please login.");
                navigate("/login");
            } catch (error) {
                setErrors({ email: error.message || "Failed to sign up" });
            }
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-4">
                <img
                    src={logo}
                    alt="EduNest"
                    width="90"
                    className="mb-3"
                />
                <h2 className="fw-bold">EduNest</h2>
                <p className="text-muted">Learn. Achieve. Inspire.</p>
            </div>

            <h4 className="text-center mb-4">Create Account</h4>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <Input
                        type="text"
                        name="fullName"
                        placeholder="Enter Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    {errors.fullName && (
                        <small className="text-danger">{errors.fullName}</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Mobile Number</label>
                    <Input
                        type="text"
                        name="mobile"
                        placeholder="Enter Mobile Number"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                    {errors.mobile && (
                        <small className="text-danger">{errors.mobile}</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && (
                        <small className="text-danger">{errors.email}</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                        <small className="text-danger">{errors.gender}</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>
                </div>



                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Create Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && (
                        <small className="text-danger">{errors.password}</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                        <small className="text-danger">{errors.confirmPassword}</small>
                    )}
                </div>

                <div className="form-check mb-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="terms"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="terms">
                        I Agree to the Terms & Conditions
                    </label>
                    {errors.terms && (
                        <div className="text-danger small">{errors.terms}</div>
                    )}
                </div>

                <div className="d-grid">
                    <Button
                        type="submit"
                        text="Create Account"
                        className="btn btn-primary btn-lg"
                    />
                </div>

                <div className="text-center mt-4">
                    <span>Already have an account?</span>
                    <Link to="/login" className="ms-2 text-decoration-none fw-bold">
                        Login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default Signup;