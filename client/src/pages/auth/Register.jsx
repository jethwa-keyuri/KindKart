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
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!formData.role) {
            setError("Please select whether you are a Donor or an NGO.");
            return;
        }
        try {
            const res = await axios.post("http://localhost:8000/api/auth/register", formData);
            const user = res.data.user;
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/login", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="auth-page">
            {/* Left brand panel */}
            <div className="auth-brand">
                <div className="auth-brand-icon">🌿</div>
                <div className="auth-brand-logo">Kind<span>Kart</span></div>
                <p className="auth-brand-tagline">
                    Join our community of donors and NGOs working together to end food waste.
                </p>
            </div>

            {/* Right form panel */}
            <div className="auth-form-panel">
                <div className="auth-card">
                    <h2>Create account</h2>
                    <p className="auth-subtitle">Join FoodBridge and start making a difference</p>

                    {error && <div className="auth-error">{error}</div>}

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
                                required
                            />
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
                                required
                            />
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
                                required
                            />
                        </div>

                        {/* Role selector */}
                        <div className="auth-role-group">
                            <label className="role-label">I am a:</label>
                            <div className="role-options">
                                <label className={`role-option${formData.role === "DONOR" ? " selected" : ""}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="DONOR"
                                        checked={formData.role === "DONOR"}
                                        onChange={handleChange}
                                    />
                                    🍱 Food Donor
                                </label>
                                <label className={`role-option${formData.role === "NGO" ? " selected" : ""}`}>
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
                                required
                            />
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
                                required
                            />
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
