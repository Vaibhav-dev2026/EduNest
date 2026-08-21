import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, setCurrentSession } from "../../services/authService";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import logo from "../../assets/logo/logo.jpeg";

function Login() {
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setLoginData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const validateForm = () => {
        let validationErrors = {};

        if (loginData.email.trim() === "") {
            validationErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(loginData.email)
        ) {
            validationErrors.email = "Enter a valid email address";
        }

        if (loginData.password.trim() === "") {
            validationErrors.password = "Password is required";
        } else if (loginData.password.length < 6) {
            validationErrors.password = "Minimum 6 characters required";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (validateForm()) {
            try {
                const response = await login(loginData);
                setCurrentSession(response.token, response.user);

                // Redirect based on role
                if (response.user.role === "admin") {
                    navigate("/dashboard");
                } else if (response.user.role === "teacher") {
                    navigate("/teacher/dashboard");
                } else if (response.user.role === "student") {
                    navigate("/student/dashboard");
                } else {
                    navigate("/login");
                }
            } catch (error) {
                setErrors({ password: error.message || "Invalid Email or Password!" });
            }
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-4">
                <img
                    src={logo}
                    alt="EduNest Logo"
                    width="90"
                    className="mb-3"
                />

                <h2 className="fw-bold">EduNest</h2>
                <p className="text-muted">Learn. Achieve. Inspire.</p>
            </div>

            <h4 className="text-center mb-4">Administrator Login</h4>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={loginData.email}
                        onChange={handleChange}
                    />
                    {errors.email && (
                        <small className="text-danger">{errors.email}</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Enter Password"
                        value={loginData.password}
                        onChange={handleChange}
                    />
                    {errors.password && (
                        <small className="text-danger">{errors.password}</small>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                        />
                        <label
                            className="form-check-label"
                            htmlFor="rememberMe"
                        >
                            Remember Me
                        </label>
                    </div>

                    <Link
                        to="/forgot-password"
                        className="text-decoration-none"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <div className="d-grid">
                    <Button
                        type="submit"
                        text="Login"
                        className="btn btn-primary"
                    />
                </div>

                <div className="text-center mt-4">
                    <span>Don't have an account?</span>
                    <Link
                        to="/signup"
                        className="ms-2 text-decoration-none fw-bold"
                    >
                        Sign Up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default Login;