import {useState} from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        phone: "",
        address: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!formData.role) {
            setError("Please tell us if you are a Donor or an NGO.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:8000/api/auth/register", formData);
            const user = res.data.user;

            if (user.role === "Donor") {
                navigate("/donor/dashboard");
            } else if (user.role === "NGO") {
                navigate("/ngo/dashboard");
            } else if (user.role === "Admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} style={{ margin: '2rem 0' }}>
                <h2>Register</h2>
                {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                />
                
                {/* Radio buttons for Role */}
                <div className="radio-group" style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0.2rem', color: '#475569' }}>
                    <span style={{ fontWeight: 600 }}>I am a:</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name="role" 
                            value="Donor" 
                            checked={formData.role === "Donor"} 
                            onChange={handleChange} 
                            required 
                            style={{ width: 'auto', padding: 0 }}
                        />
                        Food Donor
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name="role" 
                            value="NGO" 
                            checked={formData.role === "NGO"} 
                            onChange={handleChange} 
                            required 
                            style={{ width: 'auto', padding: 0 }}
                        />
                        NGO
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name="role" 
                            value="Admin" 
                            checked={formData.role === "Admin"} 
                            onChange={handleChange} 
                            required 
                            style={{ width: 'auto', padding: 0 }}
                        />
                        Admin
                    </label>
                </div>

                <input 
                    type="text" 
                    name="phone" 
                    placeholder="Phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="text" 
                    name="address" 
                    placeholder="Address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                />
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
};

export default Register;