import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import logo from "../../assets/logo/logo.jpeg";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (email.trim() === "") {
            setError("Email is required");
            return;
        }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            setError("Enter valid email address");
            return;
        }

        setError("");
        console.log("Reset email sent to:", email);
        
        // 1. Success Message dikhao
        setIsSubmitted(true);
        alert("Password reset link has been sent to your email! 📩");

        // 2. User ko Login page par redirect kar do
        navigate("/login");
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

                <h2 className="fw-bold">Forgot Password</h2>

                <p className="text-muted">
                    Enter your registered email address
                </p>
            </div>

            {isSubmitted ? (
                <div className="alert alert-success text-center" role="alert">
                    Reset link sent! Please check your inbox.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>

                        <Input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />

                        {error && (
                            <small className="text-danger d-block mt-1">
                                {error}
                            </small>
                        )}
                    </div>

                    <div className="d-grid">
                        <Button
                            type="submit"
                            text="Send Reset Link"
                            className="btn btn-primary"
                        />
                    </div>

                    <div className="text-center mt-4">
                        <Link
                            to="/login"
                            className="text-decoration-none fw-bold"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}

export default ForgotPassword;