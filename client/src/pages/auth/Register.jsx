import { useState } from "react";
import "./Login.css";
import "./Register.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", role: "", phone: "", address: "", email: "", password: ""
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setFieldErrors({});
        try {
            const res = await axios.post("http://localhost:8000/api/auth/register", formData);
            const user = res.data.user;
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/login", { replace: true });
        } catch (err) {
            const data = err.response?.data;
            // Zod field errors from validateMiddleware
            if (data?.errors?.length) {
                const mapped = {};
                data.errors.forEach(({ field, message }) => { mapped[field] = message; });
                setFieldErrors(mapped);
            } else {
                setServerError(data?.message || "Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <div className="auth-brand-icon">🌿</div>
                <div className="auth-brand-logo">Kind<span>Kart</span></div>
                <p className="auth-brand-tagline">
                    Join our community of donors and NGOs working together to end food waste.
                </p>
            </div>

            <div className="auth-form-panel">
                <div className="auth-card">
                    <h2>Create account</h2>
                    <p className="auth-subtitle">Join FoodBridge and start making a difference</p>

                    {serverError && <div className="auth-error">{serverError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Your name or organization"
                                value={formData.name}
                                onChange={handleChange}
                                className={fieldErrors.name ? "input-error" : ""}
                            />
                            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                        </div>

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

                        <div className="auth-role-group">
                            <label className="role-label">I am a:</label>
                            <div className="role-options">
                                <label className={`role-option${formData.role === "DONOR" ? " selected" : ""}${fieldErrors.role ? " role-error" : ""}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="DONOR"
                                        checked={formData.role === "DONOR"}
                                        onChange={handleChange}
                                    />
                                    🍱 Food Donor
                                </label>
                                <label className={`role-option${formData.role === "NGO" ? " selected" : ""}${fieldErrors.role ? " role-error" : ""}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="NGO"
                                        checked={formData.role === "NGO"}
                                        onChange={handleChange}
                                    />
                                    🤝 NGO
                                </label>
                            </div>
                            {fieldErrors.role && <span className="field-error">{fieldErrors.role}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="phone">Phone number</label>
                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                placeholder="+1 234 567 8900"
                                value={formData.phone}
                                onChange={handleChange}
                                className={fieldErrors.phone ? "input-error" : ""}
                            />
                            {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="address">Address</label>
                            <input
                                id="address"
                                type="text"
                                name="address"
                                placeholder="123 Main St, City"
                                value={formData.address}
                                onChange={handleChange}
                                className={fieldErrors.address ? "input-error" : ""}
                            />
                            {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
                        </div>

                        <button type="submit" className="auth-btn">Create Account</button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
