import { useState } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // clear field error as user types
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setFieldErrors({});
        try {
            const res = await axios.post("http://localhost:8000/api/auth/login", formData);
            const user = res.data.user;
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(user));

            if (user.role === "DONOR") navigate("/donor/dashboard", { replace: true });
            else if (user.role === "NGO") navigate("/ngo/dashboard", { replace: true });
            else if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
            else navigate("/", { replace: true });
        } catch (err) {
            const data = err.response?.data;
            // Zod field errors from validateMiddleware
            if (data?.errors?.length) {
                const mapped = {};
                data.errors.forEach(({ field, message }) => { mapped[field] = message; });
                setFieldErrors(mapped);
            } else {
                setServerError(data?.message || "Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <div className="auth-brand-icon">🌿</div>
                <div className="auth-brand-logo">Kind<span>Kart</span></div>
                <p className="auth-brand-tagline">
                    Connecting generous donors with NGOs to reduce food waste and fight hunger.
                </p>
            </div>

            <div className="auth-form-panel">
                <div className="auth-card">
                    <h2>Welcome back</h2>
                    <p className="auth-subtitle">Sign in to your account to continue</p>

                    {serverError && <div className="auth-error">{serverError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={fieldErrors.email ? "input-error" : ""}
                            />
                            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className={fieldErrors.password ? "input-error" : ""}
                            />
                            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                        </div>

                        <button type="submit" className="auth-btn">Sign In</button>
                    </form>

                    <div className="auth-footer">
                        Don&apos;t have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
