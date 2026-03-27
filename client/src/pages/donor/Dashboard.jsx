import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [donationForm, setDonationForm] = useState({
        foodType: "",
        quantity: "",
        description: "",
        expiryTime: "",
        location: ""
    });
    const [myDonations, setMyDonations] = useState([]);
    const [ngoRequests, setNgoRequests] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalDonations: 0,
        totalMeals: 0,
        ngosHelped: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    // Browse NGOs state
    const [ngoList, setNgoList] = useState([]);
    const [ngoSearch, setNgoSearch] = useState("");
    const [ngoFilter, setNgoFilter] = useState("all"); // all, active, top, nearest
    const [selectedNgo, setSelectedNgo] = useState(null);
    const [ngoLoading, setNgoLoading] = useState(false);
    // Location state for nearest NGO
    const [donorLocation, setDonorLocation] = useState(null); // { lat, lng }
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, granted, denied, unavailable
    // Rating & Review state
    const [ngoReviews, setNgoReviews] = useState([]);
    const [ngoReviewStats, setNgoReviewStats] = useState({ totalReviews: 0, averageRating: 0, distribution: {} });
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        role: "",
        phone: "",
        address: "",
        email: "",
    });

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
            const res = await axios.get("http://localhost:8000/api/donor/dashboard-stats", {
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
        if (activeTab === 'mydonations') {
            fetchMyDonations();
        } else if (activeTab === 'requests') {
            fetchNgoRequests();
        } else if (activeTab === 'dashboard') {
            fetchDashboardStats();
        } else if (activeTab === 'browsengos') {
            fetchNgoList();
        }
    }, [activeTab]);

    const fetchMyDonations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8000/api/donor/my-donations", { headers: { Authorization: `Bearer ${token}` } });
            setMyDonations(res.data.donations || []);
        } catch (e) {
            console.error("Failed to fetch donations", e);
        }
    };

    const fetchNgoRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8000/api/donor/ngo-requests", { headers: { Authorization: `Bearer ${token}` } });
            setNgoRequests(res.data.requests || []);
        } catch (e) {
            console.error("Failed to fetch NGO requests", e);
        }
    };

    const fetchNgoList = async (searchTerm = "", sortBy = "") => {
        try {
            setNgoLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (donorLocation) {
                params.set('lat', donorLocation.lat);
                params.set('lng', donorLocation.lng);
            }
            if (sortBy) params.set('sortBy', sortBy);
            const queryStr = params.toString() ? `?${params.toString()}` : '';
            const res = await axios.get(`http://localhost:8000/api/donor/browse-ngos${queryStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNgoList(res.data.ngos || []);
        } catch (e) {
            console.error("Failed to fetch NGOs", e);
        } finally {
            setNgoLoading(false);
        }
    };

    const handleNgoSearch = (e) => {
        const val = e.target.value;
        setNgoSearch(val);
        fetchNgoList(val, ngoFilter === 'nearest' ? 'nearest' : '');
    };

    // Fetch reviews for a specific NGO
    const fetchNgoReviews = async (ngoId) => {
        try {
            setReviewLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8000/api/ratings/ngo/${ngoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNgoReviews(res.data.reviews || []);
            setNgoReviewStats(res.data.stats || { totalReviews: 0, averageRating: 0, distribution: {} });
        } catch (e) {
            console.error('Failed to fetch reviews', e);
        } finally {
            setReviewLoading(false);
        }
    };

    // Fetch reviews when an NGO is selected
    useEffect(() => {
        if (selectedNgo) {
            fetchNgoReviews(selectedNgo.id);
            setReviewForm({ rating: 0, comment: '' });
            setEditingReview(false);
            setReviewHover(0);
        } else {
            setNgoReviews([]);
            setNgoReviewStats({ totalReviews: 0, averageRating: 0, distribution: {} });
        }
    }, [selectedNgo?.id]);
    // Request browser geolocation
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('unavailable');
            return;
        }
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setDonorLocation(coords);
                setLocationStatus('granted');
                // Save coordinates to profile silently
                try {
                    const token = localStorage.getItem("token");
                    await axios.put("http://localhost:8000/api/profile", {
                        latitude: coords.lat,
                        longitude: coords.lng
                    }, { headers: { Authorization: `Bearer ${token}` } });
                } catch (e) {
                    console.error("Failed to save location to profile", e);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationStatus('denied');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // When nearest filter is selected, request location if not already granted
    const handleNearestFilter = () => {
        setNgoFilter('nearest');
        if (!donorLocation) {
            requestLocation();
        }
    };

    // Re-fetch with nearest sort when location becomes available and filter is nearest
    useEffect(() => {
        if (donorLocation && ngoFilter === 'nearest' && activeTab === 'browsengos') {
            fetchNgoList(ngoSearch, 'nearest');
        }
    }, [donorLocation]);

    // Re-fetch when filter changes
    useEffect(() => {
        if (activeTab === 'browsengos') {
            fetchNgoList(ngoSearch, ngoFilter === 'nearest' ? 'nearest' : '');
        }
    }, [ngoFilter]);

    const getFilteredNgos = () => {
        let list = [...ngoList];
        if (ngoFilter === 'active') {
            list = list.filter(n => n.stats.activeRequests > 0);
        } else if (ngoFilter === 'top') {
            list = list.sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);
        } else if (ngoFilter === 'nearest') {
            // Already sorted from API, but also push unknown-distance to end
            list = list.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }
        return list;
    };

    const formatDistance = (km) => {
        if (km === null || km === undefined) return null;
        if (km < 1) return `${Math.round(km * 1000)} m`;
        if (km < 10) return `${km.toFixed(1)} km`;
        return `${Math.round(km)} km`;
    };

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

    const handleDonationChange = (e) => {
        setDonationForm({ ...donationForm, [e.target.name]: e.target.value });
    };

    const handleDonationSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8000/api/donor/request",
                donationForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Donation successfully sent to all NGOs!");
            setDonationForm({ foodType: "", quantity: "", description: "", expiryTime: "", location: "" });
            setActiveTab("mydonations");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create donation");
            console.error(error);
        }
    };

    // ─── Fulfill NGO Request ─────────────
    const handleFulfillRequest = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/api/donor/fulfill-request/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state immediately
            setNgoRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: "ACCEPTED" } : r)
            );
        } catch (e) {
            console.error(e);
            alert("Failed to fulfill request");
        }
    };

    // ─── Update own donation status ─────────────
    const handleUpdateDonationStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/api/donor/donation-status/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMyDonations(prev =>
                prev.map(d => d.id === id ? { ...d, status: newStatus } : d)
            );
        } catch (e) {
            console.error(e);
            alert("Failed to update donation status");
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

    const statusClass = (status) => {
        switch (status) {
            case "PENDING": return "pending";
            case "ACCEPTED": return "accepted";
            case "PICKED_UP": return "pickedup";
            case "COMPLETED": return "completed";
            default: return "";
        }
    };

    const urgencyLabel = (u) => {
        if (u === "High") return "🔴 High";
        if (u === "Medium") return "🟡 Medium";
        return "🟢 Low";
    };

    // Context-aware action buttons for NGO requests
    const renderNgoRequestActions = (req) => {
        switch (req.status) {
            case "PENDING":
                return (
                    <button className="action-btn primary small" style={{ marginTop: '0.5rem' }} onClick={() => handleFulfillRequest(req.id)}>
                        🤝 Fulfill Request
                    </button>
                );
            case "ACCEPTED":
                return (
                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#6A9C89', fontWeight: '600', fontSize: '0.9rem' }}>✅ Fulfilled by you</span>
                    </div>
                );
            case "COMPLETED":
                return (
                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#16423C', fontWeight: '600', fontSize: '0.9rem' }}>✔️ Completed</span>
                    </div>
                );
            default:
                return null;
        }
    };

    // Context-aware action buttons for own donations
    const renderDonationActions = (don) => {
        switch (don.status) {
            case "PENDING":
                return (
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        <button className="action-btn secondary small" onClick={() => handleUpdateDonationStatus(don.id, "COMPLETED")}>
                            ❌ Cancel
                        </button>
                    </div>
                );
            case "ACCEPTED":
                return (
                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#6A9C89', fontWeight: '600', fontSize: '0.9rem' }}>✅ Accepted by NGO</span>
                    </div>
                );
            case "PICKED_UP":
                return (
                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#e0a800', fontWeight: '600', fontSize: '0.9rem' }}>🚚 Picked Up</span>
                    </div>
                );
            case "COMPLETED":
                return (
                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#16423C', fontWeight: '600', fontSize: '0.9rem' }}>✔️ Completed</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="donor-dashboard-container">
            <aside className="donor-sidebar">
                <div className="sidebar-top">
                    <h2 className="logo">
                        <span className="logo-icon">✨</span> KindKart
                    </h2>
                    <nav className="menu">
                        <a className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            Dashboard
                        </a>
                        <a className={activeTab === 'createdonations' ? 'active' : ''} onClick={() => setActiveTab('createdonations')}>
                            Create Donation
                        </a>
                        <a className={activeTab === 'mydonations' ? 'active' : ''} onClick={() => setActiveTab('mydonations')}>
                            My Donations
                        </a>
                        <a className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                            NGO Requests
                        </a>
                        <a className={activeTab === 'browsengos' ? 'active' : ''} onClick={() => setActiveTab('browsengos')}>
                            🏢 Browse NGOs
                        </a>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <nav className="menu">
                        <a className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <i className="icon">👤</i> Profile
                        </a>
                    </nav>
                    <div className="user-info">
                        <div className="avatar">{profileData.name?.charAt(0)?.toUpperCase() || "D"}</div>
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
                    <h1>Welcome back, {profileData.name}! 👋</h1>
                    <p className="subtitle">Here's an overview of your impact today.</p>
                </header>

                <div className="dashboard-scrollable-content">
                    {/* ─── DASHBOARD TAB ─── */}
                    {activeTab === 'dashboard' && (
                        <div className="tab-content fade-in">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon purple">🍽️</div>
                                    <div className="stat-info">
                                        <h3>Meals Provided</h3>
                                        <p className="stat-number">{dashboardStats.totalMeals.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon blue">📦</div>
                                    <div className="stat-info">
                                        <h3>Total Donations</h3>
                                        <p className="stat-number">{dashboardStats.totalDonations}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon pink">🤝</div>
                                    <div className="stat-info">
                                        <h3>NGOs Helped</h3>
                                        <p className="stat-number">{dashboardStats.ngosHelped}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <div className="recent-activity section-card">
                                    <div className="section-header">
                                        <h2>Recent Activity</h2>
                                        <button className="view-all-btn" onClick={() => setActiveTab('mydonations')}>View All</button>
                                    </div>
                                    {recentActivity.length === 0 ? (
                                        <p className="placeholder-text">No activity yet. Create your first donation!</p>
                                    ) : (
                                        <ul className="activity-list">
                                            {recentActivity.map(item => (
                                                <li className="activity-item" key={item.id}>
                                                    <div className={`activity-dot ${item.status === 'PENDING' ? 'pending' : ''}`}></div>
                                                    <div className="activity-details">
                                                        <p className="activity-title">{item.foodType} — {item.quantity}</p>
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
                                        <button className="action-btn primary" onClick={() => setActiveTab('createdonations')}>
                                            + New Donation
                                        </button>
                                        <button className="action-btn secondary" onClick={() => setActiveTab('requests')}>
                                            Browse NGO Requests
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── CREATE DONATION TAB ─── */}
                    {activeTab === 'createdonations' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <h2>Create Donation</h2>
                                <form className="dashboard-form" onSubmit={handleDonationSubmit}>
                                    <div className="form-group">
                                        <label>Food Type</label>
                                        <input type="text" name="foodType" placeholder="e.g. Cooked Rice, Canned Beans" value={donationForm.foodType} onChange={handleDonationChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input type="text" name="quantity" placeholder="e.g. 50 servings, 20 kg" value={donationForm.quantity} onChange={handleDonationChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" placeholder="Brief description of the food items" value={donationForm.description} onChange={handleDonationChange}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Time</label>
                                        <input type="datetime-local" name="expiryTime" value={donationForm.expiryTime} onChange={handleDonationChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" name="location" placeholder="Pickup location address" value={donationForm.location} onChange={handleDonationChange} required />
                                    </div>
                                    <button type="submit" className="action-btn primary">Submit Donation</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ─── MY DONATIONS TAB ─── */}
                    {activeTab === 'mydonations' && (
                        <div className="tab-content fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>My Donations</h2>
                                <button className="action-btn primary small" onClick={() => setActiveTab('createdonations')}>
                                    + New Donation
                                </button>
                            </div>
                            <div className="card-list">
                                {myDonations.length === 0 ? (
                                    <p className="placeholder-text" style={{ marginTop: '1rem' }}>No donations made yet.</p>
                                ) : (
                                    myDonations.map(don => (
                                        <div className="item-card" key={don.id}>
                                            <h4>🍽️ {don.foodType}</h4>
                                            <p><strong>Quantity:</strong> {don.quantity}</p>
                                            <p><strong>Location:</strong> {don.location}</p>
                                            <p><strong>Description:</strong> {don.description || "—"}</p>
                                            <p><strong>Expiry:</strong> {new Date(don.expiryTime).toLocaleString()}</p>
                                            <p><strong>Status:</strong> <span className={`status ${statusClass(don.status)}`}>{don.status}</span></p>
                                            <p><strong>Created:</strong> {new Date(don.createdAt).toLocaleString()}</p>
                                            {renderDonationActions(don)}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── NGO REQUESTS TAB ─── */}
                    {activeTab === 'requests' && (
                        <div className="tab-content fade-in">
                            <h2>NGO Requests</h2>
                            <div className="card-list">
                                {ngoRequests.length === 0 ? (
                                    <p className="placeholder-text" style={{ marginTop: '1rem' }}>No requests from NGOs yet.</p>
                                ) : (
                                    ngoRequests.map(req => (
                                        <div className="item-card" key={req.id}>
                                            <h4>📋 {req.title}</h4>
                                            <p><strong>NGO:</strong> {req.ngoName || "Unknown NGO"}</p>
                                            <p><strong>Description:</strong> {req.description || "—"}</p>
                                            <p><strong>Quantity Needed:</strong> {req.quantity}</p>
                                            <p><strong>Urgency:</strong> {urgencyLabel(req.urgency)}</p>
                                            <p><strong>Status:</strong> <span className={`status ${statusClass(req.status)}`}>{req.status}</span></p>
                                            {renderNgoRequestActions(req)}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── BROWSE NGOs TAB ─── */}
                    {activeTab === 'browsengos' && (
                        <div className="tab-content fade-in">
                            <div className="browse-ngos-header">
                                <div>
                                    <h2 style={{ margin: 0 }}>Discover NGOs</h2>
                                    <p style={{ margin: '0.3rem 0 0', color: '#6A9C89', fontSize: '0.95rem' }}>Find and connect with NGOs making a difference</p>
                                </div>
                                <div className="ngo-search-box">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name or location..."
                                        value={ngoSearch}
                                        onChange={handleNgoSearch}
                                        className="ngo-search-input"
                                    />
                                </div>
                            </div>

                            <div className="ngo-filter-bar">
                                <button className={`filter-chip ${ngoFilter === 'all' ? 'active' : ''}`} onClick={() => setNgoFilter('all')}>All NGOs</button>
                                <button className={`filter-chip ${ngoFilter === 'active' ? 'active' : ''}`} onClick={() => setNgoFilter('active')}>🟢 Active Requests</button>
                                <button className={`filter-chip ${ngoFilter === 'top' ? 'active' : ''}`} onClick={() => setNgoFilter('top')}>⭐ Most Active</button>
                                <button className={`filter-chip nearest-chip ${ngoFilter === 'nearest' ? 'active' : ''}`} onClick={handleNearestFilter}>
                                    {locationStatus === 'loading' ? (
                                        <><span className="location-spinner"></span> Locating...</>
                                    ) : locationStatus === 'granted' ? (
                                        <>📍 Nearest</>
                                    ) : locationStatus === 'denied' ? (
                                        <>⚠️ Location Denied</>
                                    ) : (
                                        <>📍 Nearest</>
                                    )}
                                </button>
                                {locationStatus === 'granted' && ngoFilter === 'nearest' && (
                                    <span className="location-active-badge">
                                        ✓ Location active
                                    </span>
                                )}
                                <span className="ngo-count-badge">{getFilteredNgos().length} NGO{getFilteredNgos().length !== 1 ? 's' : ''}</span>
                            </div>
                            {locationStatus === 'denied' && ngoFilter === 'nearest' && (
                                <div className="location-denied-banner">
                                    <span>📍</span>
                                    <p>Location access was denied. Please enable location in your browser settings to see nearest NGOs.</p>
                                    <button onClick={requestLocation}>Try Again</button>
                                </div>
                            )}

                            {ngoLoading ? (
                                <div className="ngo-loading">
                                    <div className="ngo-spinner"></div>
                                    <p>Loading NGOs...</p>
                                </div>
                            ) : getFilteredNgos().length === 0 ? (
                                <div className="ngo-empty-state">
                                    <span style={{ fontSize: '3rem' }}>🏢</span>
                                    <h3>No NGOs Found</h3>
                                    <p>Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <div className="ngo-grid">
                                    {getFilteredNgos().map(ngo => (
                                        <div className="ngo-card" key={ngo.id} onClick={() => setSelectedNgo(ngo)}>
                                            <div className="ngo-card-header">
                                                <div className="ngo-avatar-large">
                                                    {ngo.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="ngo-card-title">
                                                    <h3>{ngo.name}</h3>
                                                    <p className="ngo-card-location">
                                                        📍 {ngo.address || 'Location not specified'}
                                                    </p>
                                                </div>
                                                {formatDistance(ngo.distance) && (
                                                    <span className="distance-badge">
                                                        📍 {formatDistance(ngo.distance)}
                                                    </span>
                                                )}
                                                {ngo.stats.activeRequests > 0 && (
                                                    <span className="active-badge pulse">Active</span>
                                                )}
                                            </div>
                                            {/* Star rating display on card */}
                                            {ngo.ratingInfo && ngo.ratingInfo.totalReviews > 0 && (
                                                <div className="ngo-card-rating">
                                                    <div className="star-display-small">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <span key={s} className={`star-sm ${s <= Math.round(ngo.ratingInfo.averageRating) ? 'filled' : ''}`}>★</span>
                                                        ))}
                                                    </div>
                                                    <span className="rating-text-sm">{ngo.ratingInfo.averageRating}</span>
                                                    <span className="review-count-sm">({ngo.ratingInfo.totalReviews})</span>
                                                </div>
                                            )}
                                            <div className="ngo-card-stats">
                                                <div className="ngo-stat">
                                                    <span className="ngo-stat-value">{ngo.stats.totalRequests}</span>
                                                    <span className="ngo-stat-label">Requests</span>
                                                </div>
                                                <div className="ngo-stat-divider"></div>
                                                <div className="ngo-stat">
                                                    <span className="ngo-stat-value">{ngo.stats.activeRequests}</span>
                                                    <span className="ngo-stat-label">Active</span>
                                                </div>
                                                <div className="ngo-stat-divider"></div>
                                                <div className="ngo-stat">
                                                    <span className="ngo-stat-value">{ngo.stats.fulfilledRequests}</span>
                                                    <span className="ngo-stat-label">Fulfilled</span>
                                                </div>
                                            </div>
                                            {ngo.recentRequests.length > 0 && (
                                                <div className="ngo-card-requests">
                                                    <p className="ngo-card-requests-label">Active needs:</p>
                                                    {ngo.recentRequests.slice(0, 2).map(req => (
                                                        <div className="ngo-mini-request" key={req.id}>
                                                            <span className={`urgency-dot urgency-${(req.urgency || 'low').toLowerCase()}`}></span>
                                                            <span className="mini-req-title">{req.title}</span>
                                                            <span className="mini-req-qty">{req.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="ngo-card-footer">
                                                <span className="ngo-card-joined">Joined {new Date(ngo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                                <button className="ngo-view-btn" onClick={(e) => { e.stopPropagation(); setSelectedNgo(ngo); }}>View Details →</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ─── NGO DETAIL MODAL ─── */}
                            {selectedNgo && (
                                <div className="ngo-modal-overlay" onClick={() => setSelectedNgo(null)}>
                                    <div className="ngo-modal" onClick={(e) => e.stopPropagation()}>
                                        <button className="ngo-modal-close" onClick={() => setSelectedNgo(null)}>✕</button>

                                        <div className="ngo-modal-header">
                                            <div className="ngo-avatar-xl">
                                                {selectedNgo.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <h2>{selectedNgo.name}</h2>
                                                <p className="ngo-modal-meta">📍 {selectedNgo.address || 'No address'} • 📧 {selectedNgo.email}</p>
                                                {selectedNgo.phone && <p className="ngo-modal-meta">📞 {selectedNgo.phone}</p>}
                                                {formatDistance(selectedNgo.distance) && (
                                                    <p className="ngo-modal-meta distance-meta">🧭 {formatDistance(selectedNgo.distance)} away from you</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ngo-modal-stats">
                                            <div className="modal-stat-card">
                                                <span className="modal-stat-icon">📋</span>
                                                <span className="modal-stat-val">{selectedNgo.stats.totalRequests}</span>
                                                <span className="modal-stat-lbl">Total Requests</span>
                                            </div>
                                            <div className="modal-stat-card">
                                                <span className="modal-stat-icon">🟢</span>
                                                <span className="modal-stat-val">{selectedNgo.stats.activeRequests}</span>
                                                <span className="modal-stat-lbl">Active</span>
                                            </div>
                                            <div className="modal-stat-card">
                                                <span className="modal-stat-icon">✅</span>
                                                <span className="modal-stat-val">{selectedNgo.stats.fulfilledRequests}</span>
                                                <span className="modal-stat-lbl">Fulfilled</span>
                                            </div>
                                        </div>

                                        <div className="ngo-modal-requests">
                                            <h3>Active Requests</h3>
                                            {selectedNgo.recentRequests.length === 0 ? (
                                                <p className="placeholder-text">No active requests at this time.</p>
                                            ) : (
                                                selectedNgo.recentRequests.map(req => (
                                                    <div className="modal-request-card" key={req.id}>
                                                        <div className="modal-req-top">
                                                            <h4>{req.title}</h4>
                                                            <span className={`urgency-badge urgency-${(req.urgency || 'low').toLowerCase()}`}>
                                                                {req.urgency === 'High' ? '🔴' : req.urgency === 'Medium' ? '🟡' : '🟢'} {req.urgency || 'Low'}
                                                            </span>
                                                        </div>
                                                        <p>{req.description || 'No description provided.'}</p>
                                                        <p><strong>Quantity needed:</strong> {req.quantity}</p>
                                                        <button className="action-btn primary small" onClick={async () => {
                                                            await handleFulfillRequest(req.id);
                                                            // Refresh NGO data
                                                            fetchNgoList(ngoSearch);
                                                            setSelectedNgo(prev => ({
                                                                ...prev,
                                                                recentRequests: prev.recentRequests.filter(r => r.id !== req.id),
                                                                stats: {
                                                                    ...prev.stats,
                                                                    activeRequests: Math.max(0, prev.stats.activeRequests - 1),
                                                                    fulfilledRequests: prev.stats.fulfilledRequests + 1,
                                                                }
                                                            }));
                                                        }}>🤝 Fulfill This Request</button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* ─── REVIEWS SECTION ─── */}
                                        <div className="ngo-modal-reviews">
                                            <div className="reviews-header">
                                                <h3>Ratings & Reviews</h3>
                                                {ngoReviewStats.totalReviews > 0 && (
                                                    <div className="reviews-summary-inline">
                                                        <span className="avg-rating-big">{ngoReviewStats.averageRating}</span>
                                                        <div className="star-display">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <span key={s} className={`star ${s <= Math.round(ngoReviewStats.averageRating) ? 'filled' : ''}`}>★</span>
                                                            ))}
                                                        </div>
                                                        <span className="total-reviews-text">{ngoReviewStats.totalReviews} review{ngoReviewStats.totalReviews !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rating Distribution */}
                                            {ngoReviewStats.totalReviews > 0 && (
                                                <div className="rating-distribution">
                                                    {[5, 4, 3, 2, 1].map(star => {
                                                        const cnt = ngoReviewStats.distribution?.[star] || 0;
                                                        const pct = ngoReviewStats.totalReviews > 0 ? (cnt / ngoReviewStats.totalReviews) * 100 : 0;
                                                        return (
                                                            <div className="dist-row" key={star}>
                                                                <span className="dist-star">{star} ★</span>
                                                                <div className="dist-bar-bg">
                                                                    <div className="dist-bar-fill" style={{ width: `${pct}%` }}></div>
                                                                </div>
                                                                <span className="dist-count">{cnt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Review Form */}
                                            <div className="review-form-card">
                                                <h4>{editingReview ? 'Update Your Review' : 'Write a Review'}</h4>
                                                <div className="star-input">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <span
                                                            key={s}
                                                            className={`star-interactive ${s <= (reviewHover || reviewForm.rating) ? 'filled' : ''}`}
                                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                                                            onMouseEnter={() => setReviewHover(s)}
                                                            onMouseLeave={() => setReviewHover(0)}
                                                        >★</span>
                                                    ))}
                                                    {reviewForm.rating > 0 && (
                                                        <span className="rating-label">
                                                            {reviewForm.rating === 1 ? 'Poor' : reviewForm.rating === 2 ? 'Fair' : reviewForm.rating === 3 ? 'Good' : reviewForm.rating === 4 ? 'Very Good' : 'Excellent'}
                                                        </span>
                                                    )}
                                                </div>
                                                <textarea
                                                    className="review-textarea"
                                                    placeholder="Share your experience with this NGO..."
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                                    maxLength={500}
                                                />
                                                <div className="review-form-footer">
                                                    <span className="char-count">{reviewForm.comment.length}/500</span>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {editingReview && (
                                                            <button className="action-btn secondary small" onClick={() => {
                                                                setEditingReview(false);
                                                                setReviewForm({ rating: 0, comment: '' });
                                                            }}>Cancel</button>
                                                        )}
                                                        <button
                                                            className="action-btn primary small"
                                                            disabled={reviewForm.rating === 0 || reviewSubmitting}
                                                            onClick={async () => {
                                                                if (reviewForm.rating === 0) return;
                                                                try {
                                                                    setReviewSubmitting(true);
                                                                    const token = localStorage.getItem('token');
                                                                    await axios.post(`http://localhost:8000/api/ratings/ngo/${selectedNgo.id}`, {
                                                                        rating: reviewForm.rating,
                                                                        comment: reviewForm.comment
                                                                    }, { headers: { Authorization: `Bearer ${token}` } });
                                                                    setReviewForm({ rating: 0, comment: '' });
                                                                    setEditingReview(false);
                                                                    // Refresh reviews
                                                                    fetchNgoReviews(selectedNgo.id);
                                                                    // Refresh NGO list for updated ratings on cards
                                                                    fetchNgoList(ngoSearch, ngoFilter === 'nearest' ? 'nearest' : '');
                                                                } catch (e) {
                                                                    alert(e.response?.data?.message || 'Failed to submit review');
                                                                } finally {
                                                                    setReviewSubmitting(false);
                                                                }
                                                            }}
                                                        >
                                                            {reviewSubmitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reviews List */}
                                            <div className="reviews-list">
                                                {reviewLoading ? (
                                                    <div className="ngo-loading" style={{ padding: '2rem' }}>
                                                        <div className="ngo-spinner"></div>
                                                    </div>
                                                ) : ngoReviews.length === 0 ? (
                                                    <p className="placeholder-text">No reviews yet. Be the first to review!</p>
                                                ) : (
                                                    ngoReviews.map(review => {
                                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                        const isOwn = review.donorId === user.id;
                                                        return (
                                                            <div className={`review-card ${isOwn ? 'own' : ''}`} key={review.id}>
                                                                <div className="review-card-top">
                                                                    <div className="review-author">
                                                                        <div className="review-avatar">{review.donorName?.charAt(0)?.toUpperCase() || 'D'}</div>
                                                                        <div>
                                                                            <p className="review-name">{review.donorName || 'Anonymous'} {isOwn && <span className="you-badge">You</span>}</p>
                                                                            <p className="review-date">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="review-stars">
                                                                        {[1, 2, 3, 4, 5].map(s => (
                                                                            <span key={s} className={`star-sm ${s <= review.rating ? 'filled' : ''}`}>★</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {review.comment && <p className="review-comment">{review.comment}</p>}
                                                                {isOwn && (
                                                                    <div className="review-own-actions">
                                                                        <button onClick={() => {
                                                                            setReviewForm({ rating: review.rating, comment: review.comment || '' });
                                                                            setEditingReview(true);
                                                                        }}>✏️ Edit</button>
                                                                        <button onClick={async () => {
                                                                            if (!window.confirm('Delete your review?')) return;
                                                                            try {
                                                                                const token = localStorage.getItem('token');
                                                                                await axios.delete(`http://localhost:8000/api/ratings/${review.id}`, {
                                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                                });
                                                                                fetchNgoReviews(selectedNgo.id);
                                                                                fetchNgoList(ngoSearch, ngoFilter === 'nearest' ? 'nearest' : '');
                                                                            } catch (e) {
                                                                                alert('Failed to delete review');
                                                                            }
                                                                        }}>🗑️ Delete</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── PROFILE TAB ─── */}
                    {activeTab === 'profile' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ margin: 0 }}>Profile Information</h2>
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
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Full Name</label>
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
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#6A9C89', marginBottom: '0.3rem', fontWeight: '600' }}>Address</label>
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
                                            <label>Full Name</label>
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
                                            <label>Address</label>
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

export default Dashboard;