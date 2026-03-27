import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function NgoDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        role: "",
        phone: "",
        address: "",
        email: "",
    });

    // NGO Request form state
    const [requestForm, setRequestForm] = useState({
        title: "",
        description: "",
        urgency: "High",
        quantity: ""
    });
    const [requestSubmitting, setRequestSubmitting] = useState(false);

    // My NGO requests
    const [myRequests, setMyRequests] = useState([]);

    // Dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        totalRequests: 0,
        activeRequests: 0,
        availableDonations: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    // Incoming donor donations
    const [incomingRequests, setIncomingRequests] = useState([]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8000/api/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = res.data.user;
            setProfileData({
                name: userData.name || "",
                email: userData.email || "",
                role: userData.role || "",
                phone: userData.phone || "",
                address: userData.address || "",
            });
        } catch (e) {
            console.error("Failed to fetch profile", e);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8000/api/ngo/dashboard-stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardStats(res.data.stats);
            setRecentActivity(res.data.recentActivity || []);
        } catch (e) {
            console.error("Failed to fetch dashboard stats", e);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchDonorRequests();
        } else if (activeTab === 'myrequests') {
            fetchMyRequests();
        } else if (activeTab === 'dashboard') {
            fetchDashboardStats();
        }
    }, [activeTab]);

    const handleProfileSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put("http://localhost:8000/api/profile", {
                name: profileData.name,
                phone: profileData.phone,
                address: profileData.address
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = res.data.user;
            setProfileData(prev => ({
                ...prev,
                name: updated.name,
                phone: updated.phone || "",
                address: updated.address || "",
            }));
            alert("Profile updated successfully!");
            setIsEditingProfile(false);
        } catch (e) {
            console.error(e);
            alert("Failed to update profile");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8000/api/auth/logout");
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const fetchDonorRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8000/api/ngo/donor-requests", { headers: { Authorization: `Bearer ${token}` } });
            setIncomingRequests(res.data.requests || []);
        } catch (e) {
            console.error("Failed to fetch donor requests", e);
        }
    };

    // Create NGO Request
    const handleRequestChange = (e) => {
        setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setRequestSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8000/api/ngo/create-request",
                requestForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Request posted successfully! Donors can now see your need.");
            setRequestForm({ title: "", description: "", urgency: "High", quantity: "" });
            setActiveTab("myrequests");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create request");
            console.error(error);
        } finally {
            setRequestSubmitting(false);
        }
    };

    // Fetch own requests
    const fetchMyRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8000/api/ngo/my-requests", { headers: { Authorization: `Bearer ${token}` } });
            setMyRequests(res.data.requests || []);
        } catch (e) {
            console.error("Failed to fetch my requests", e);
        }
    };

    // ─── Status Action Handlers (Donor Offers) ─────────────
    const handleAcceptDonation = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/api/ngo/accept-donation/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state immediately
            setIncomingRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: "ACCEPTED" } : r)
            );
        } catch (e) {
            console.error(e);
            alert("Failed to accept donation");
        }
    };

    const handleDenyDonation = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/api/ngo/deny-donation/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIncomingRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: "COMPLETED" } : r)
            );
        } catch (e) {
            console.error(e);
            alert("Failed to deny donation");
        }
    };

    const handlePickup = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/api/ngo/pickup-donation/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIncomingRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: "PICKED_UP" } : r)
            );
        } catch (e) {
            console.error(e);
            alert("Failed to update status");
        }
    };

    const handleCompleteDonation = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/api/ngo/complete-donation/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIncomingRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: "COMPLETED" } : r)
            );
        } catch (e) {
            console.error(e);
            alert("Failed to complete donation");
        }
    };

    // ─── Helpers ─────────────
    const timeAgo = (dateStr) => {
        const now = new Date();
        const past = new Date(dateStr);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return past.toLocaleDateString();
    };

    const urgencyLabel = (u) => {
        if (u === "High") return "🔴 High";
        if (u === "Medium") return "🟡 Medium";
        return "🟢 Low";
    };

    const statusClass = (status) => {
        switch (status) {
            case "PENDING": return "pending";
            case "ACCEPTED": return "accepted";
            case "PICKED_UP": return "pickedup";
            case "COMPLETED": return "completed";
            default: return "";
        }
    };

    // Render context-aware action buttons based on donation status
    const renderDonationActions = (req) => {
        switch (req.status) {
            case "PENDING":
                return (
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        <button className="action-btn primary small" onClick={() => handleAcceptDonation(req.id)}>
                            ✅ Accept
                        </button>
                        <button className="action-btn secondary danger small" onClick={() => handleDenyDonation(req.id)}>
                            ❌ Deny
                        </button>
                    </div>
                );
            case "ACCEPTED":
                return (
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        <button className="action-btn primary small" onClick={() => handlePickup(req.id)}>
                            🚚 Mark Picked Up
                        </button>
                    </div>
                );
            case "PICKED_UP":
                return (
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        <button className="action-btn primary small" onClick={() => handleCompleteDonation(req.id)}>
                            ✔️ Mark Completed
                        </button>
                    </div>
                );
            case "COMPLETED":
                return (
                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#6A9C89', fontWeight: '600', fontSize: '0.9rem' }}>✅ Completed</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="ngo-dashboard-container">
            <aside className="ngo-sidebar">
                <div className="sidebar-top">
                    <h2 className="logo">
                        <span className="logo-icon">🤝</span> KindKart NGO
                    </h2>
                    <nav className="menu">
                        <a className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            Dashboard
                        </a>
                        <a className={activeTab === 'createrequest' ? 'active' : ''} onClick={() => setActiveTab('createrequest')}>
                            Create Request
                        </a>
                        <a className={activeTab === 'myrequests' ? 'active' : ''} onClick={() => setActiveTab('myrequests')}>
                            My Requests
                        </a>
                        <a className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                            Donor Offers
                        </a>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <nav className="menu">
                        <a className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <i className="icon">🏢</i> Organization Profile
                        </a>
                    </nav>
                    <div className="user-info">
                        <div className="avatar ngo-avatar">{profileData.name?.charAt(0)?.toUpperCase() || "N"}</div>
                        <div className="user-details">
                            <p className="user-name">{profileData.name}</p>
                            <p className="user-role">{profileData.role}</p>
                        </div>
                        <button className="logout-btn" title="Logout" onClick={handleLogout}>
                            ⎋
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Welcome back, {profileData.name}! 🌟</h1>
                    <p className="subtitle">Track your requests and manage incoming donations.</p>
                </header>

                <div className="dashboard-scrollable-content">
                    {/* ─── DASHBOARD TAB ─── */}
                    {activeTab === 'dashboard' && (
                        <div className="tab-content fade-in">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon green">📋</div>
                                    <div className="stat-info">
                                        <h3>Total Requests</h3>
                                        <p className="stat-number">{dashboardStats.totalRequests}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange">⏳</div>
                                    <div className="stat-info">
                                        <h3>Active Requests</h3>
                                        <p className="stat-number">{dashboardStats.activeRequests}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon blue">📦</div>
                                    <div className="stat-info">
                                        <h3>Available Donations</h3>
                                        <p className="stat-number">{dashboardStats.availableDonations}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <div className="recent-activity section-card">
                                    <div className="section-header">
                                        <h2>Recent Requests</h2>
                                        <button className="view-all-btn" onClick={() => setActiveTab('myrequests')}>View All</button>
                                    </div>
                                    {recentActivity.length === 0 ? (
                                        <p className="placeholder-text">No requests yet. Post your first request!</p>
                                    ) : (
                                        <ul className="activity-list">
                                            {recentActivity.map(item => (
                                                <li className="activity-item" key={item.id}>
                                                    <div className={`activity-dot ${item.status === 'PENDING' ? 'pending' : ''}`}></div>
                                                    <div className="activity-details">
                                                        <p className="activity-title">{item.title} — {item.quantity}</p>
                                                        <p className="activity-time">{timeAgo(item.createdAt)}</p>
                                                    </div>
                                                    <span className={`status ${statusClass(item.status)}`}>{item.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="quick-actions section-card">
                                    <h2>Quick Actions</h2>
                                    <div className="action-buttons">
                                        <button className="action-btn primary" onClick={() => setActiveTab('createrequest')}>
                                            + Post New Request
                                        </button>
                                        <button className="action-btn secondary" onClick={() => setActiveTab('requests')}>
                                            Browse Donor Offers
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── CREATE REQUEST TAB ─── */}
                    {activeTab === 'createrequest' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <h2>Create Food Request</h2>
                                <p style={{ color: '#6A9C89', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                    Post your food needs — donors will see this and can help fulfill your request.
                                </p>
                                <form className="dashboard-form" onSubmit={handleRequestSubmit}>
                                    <div className="form-group">
                                        <label>Request Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="e.g. Urgent: 200 meals for flood relief camp"
                                            value={requestForm.title}
                                            onChange={handleRequestChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity Needed</label>
                                        <input
                                            type="text"
                                            name="quantity"
                                            placeholder="e.g. 100 servings, 50 kg rice"
                                            value={requestForm.quantity}
                                            onChange={handleRequestChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Urgency Level</label>
                                        <select name="urgency" value={requestForm.urgency} onChange={handleRequestChange}>
                                            <option value="High">🔴 High (Next 24 hrs)</option>
                                            <option value="Medium">🟡 Medium (Next 3 days)</option>
                                            <option value="Low">🟢 Low (This week)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            placeholder="Describe why this food is needed and any special requirements..."
                                            value={requestForm.description}
                                            onChange={handleRequestChange}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="action-btn primary"
                                        disabled={requestSubmitting}
                                    >
                                        {requestSubmitting ? "Posting..." : "Post Request"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ─── MY REQUESTS TAB ─── */}
                    {activeTab === 'myrequests' && (
                        <div className="tab-content fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>My Requests</h2>
                                <button className="action-btn primary small" onClick={() => setActiveTab('createrequest')}>
                                    + New Request
                                </button>
                            </div>
                            <div className="card-list">
                                {myRequests.length === 0 ? (
                                    <p className="placeholder-text" style={{ marginTop: '1rem' }}>You haven't posted any requests yet.</p>
                                ) : (
                                    myRequests.map(req => (
                                        <div className="item-card" key={req.id}>
                                            <h4>{req.title}</h4>
                                            <p><strong>Quantity:</strong> {req.quantity}</p>
                                            <p><strong>Urgency:</strong> {urgencyLabel(req.urgency)}</p>
                                            <p><strong>Description:</strong> {req.description || "—"}</p>
                                            <p><strong>Status:</strong> <span className={`status ${statusClass(req.status)}`}>{req.status}</span></p>
                                            <p><strong>Posted:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── DONOR OFFERS TAB ─── */}
                    {activeTab === 'requests' && (
                        <div className="tab-content fade-in">
                            <h2>Available Donor Offers</h2>
                            {incomingRequests.length === 0 ? (
                                <p className="placeholder-text" style={{ marginTop: '1rem' }}>No incoming donations available at the moment.</p>
                            ) : (
                                <div className="card-list">
                                    {incomingRequests.map(req => (
                                        <div className="item-card" key={req.id}>
                                            <h4>🍽️ {req.foodType}</h4>
                                            <p><strong>Donor:</strong> {req.donorName || "Unknown Donor"}</p>
                                            <p><strong>Quantity:</strong> {req.quantity}</p>
                                            <p><strong>Description:</strong> {req.description || "—"}</p>
                                            <p><strong>Location:</strong> {req.location}</p>
                                            <p><strong>Expiry:</strong> {req.expiryTime ? new Date(req.expiryTime).toLocaleString() : 'N/A'}</p>
                                            <p><strong>Status:</strong> <span className={`status ${statusClass(req.status)}`}>{req.status}</span></p>
                                            {renderDonationActions(req)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── PROFILE TAB ─── */}
                    {activeTab === 'profile' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ margin: 0 }}>Organization Profile</h2>
                                    {!isEditingProfile && (
                                        <button
                                            className="action-btn primary small"
                                            onClick={() => setIsEditingProfile(true)}
                                            style={{ margin: 0 }}
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {!isEditingProfile ? (
                                    <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>NGO Name</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#16423C' }}>{profileData.name}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Role</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#16423C' }}>{profileData.role}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Phone Number</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#16423C' }}>{profileData.phone || "Not provided"}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Address / HQ</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#16423C' }}>{profileData.address || "Not provided"}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Email Address</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#16423C' }}>{profileData.email}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Password</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#16423C' }}>••••••••</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="dashboard-form">
                                        <div className="form-group">
                                            <label>NGO Name</label>
                                            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Role <span style={{ fontSize: '0.8rem', color: '#999' }}>(cannot be changed)</span></label>
                                            <input type="text" value={profileData.role} readOnly style={{ backgroundColor: '#C4DAD2', cursor: 'not-allowed', color: '#6A9C89' }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Address / HQ</label>
                                            <textarea name="address" value={profileData.address} onChange={handleProfileChange}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address <span style={{ fontSize: '0.8rem', color: '#999' }}>(cannot be changed)</span></label>
                                            <input type="email" value={profileData.email} readOnly style={{ backgroundColor: '#C4DAD2', cursor: 'not-allowed', color: '#6A9C89' }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Password <span style={{ fontSize: '0.8rem', color: '#999' }}>(cannot be changed)</span></label>
                                            <input type="password" value="••••••••" readOnly style={{ backgroundColor: '#C4DAD2', cursor: 'not-allowed', color: '#6A9C89' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button type="button" className="action-btn primary" onClick={handleProfileSave}>Save Changes</button>
                                            <button type="button" className="action-btn secondary" onClick={() => { setIsEditingProfile(false); fetchProfile(); }}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default NgoDashboard;
