import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function AdminDashboard() {
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

    // Dashboard stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonors: 0,
        totalNgos: 0,
        totalDonations: 0,
        pendingDonations: 0,
        totalNgoRequests: 0,
        pendingNgoRequests: 0,
    });

    // Data lists
    const [users, setUsers] = useState([]);
    const [allDonations, setAllDonations] = useState([]);
    const [allNgoRequests, setAllNgoRequests] = useState([]);

    // Filters
    const [userRoleFilter, setUserRoleFilter] = useState("ALL");
    const [donationStatusFilter, setDonationStatusFilter] = useState("ALL");
    const [ngoReqStatusFilter, setNgoReqStatusFilter] = useState("ALL");

    const API = "http://localhost:8000/api";
    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    // ─── Fetch functions ─────────────
    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API}/profile`, getHeaders());
            const u = res.data.user;
            setProfileData({
                name: u.name || "",
                email: u.email || "",
                role: u.role || "",
                phone: u.phone || "",
                address: u.address || "",
            });
        } catch (e) {
            console.error("Failed to fetch profile", e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API}/admin/dashboard-stats`, getHeaders());
            setStats(res.data.stats);
        } catch (e) {
            console.error("Failed to fetch stats", e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API}/admin/users`, getHeaders());
            setUsers(res.data.users || []);
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
    };

    const fetchDonations = async () => {
        try {
            const res = await axios.get(`${API}/admin/donations`, getHeaders());
            setAllDonations(res.data.donations || []);
        } catch (e) {
            console.error("Failed to fetch donations", e);
        }
    };

    const fetchNgoRequests = async () => {
        try {
            const res = await axios.get(`${API}/admin/ngo-requests`, getHeaders());
            setAllNgoRequests(res.data.requests || []);
        } catch (e) {
            console.error("Failed to fetch NGO requests", e);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === "dashboard") fetchStats();
        else if (activeTab === "users") fetchUsers();
        else if (activeTab === "donations") fetchDonations();
        else if (activeTab === "requests") fetchNgoRequests();
    }, [activeTab]);

    // ─── Action handlers ─────────────
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This will also delete their donations/requests.")) return;
        try {
            await axios.delete(`${API}/admin/users/${id}`, getHeaders());
            setUsers(prev => prev.filter(u => u.id !== id));
            fetchStats();
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Failed to delete user");
        }
    };

    const handleUpdateDonationStatus = async (id, newStatus) => {
        try {
            await axios.patch(`${API}/admin/donation-status/${id}`, { status: newStatus }, getHeaders());
            setAllDonations(prev =>
                prev.map(d => d.id === id ? { ...d, status: newStatus } : d)
            );
            fetchStats();
        } catch (e) {
            console.error(e);
            alert("Failed to update donation status");
        }
    };

    const handleUpdateNgoRequestStatus = async (id, newStatus) => {
        try {
            await axios.patch(`${API}/admin/ngo-request-status/${id}`, { status: newStatus }, getHeaders());
            setAllNgoRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
            );
            fetchStats();
        } catch (e) {
            console.error(e);
            alert("Failed to update request status");
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async () => {
        try {
            const res = await axios.put(`${API}/profile`, {
                name: profileData.name,
                phone: profileData.phone,
                address: profileData.address
            }, getHeaders());
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
        try { await axios.post(`${API}/auth/logout`); } catch (e) { console.error(e); }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
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

    // Filter helpers
    const filteredUsers = users.filter(u => {
        if (userRoleFilter === "ALL") return true;
        return u.role === userRoleFilter;
    });

    const filteredDonations = allDonations.filter(d => {
        if (donationStatusFilter === "ALL") return true;
        return d.status === donationStatusFilter;
    });

    const filteredNgoRequests = allNgoRequests.filter(r => {
        if (ngoReqStatusFilter === "ALL") return true;
        return r.status === ngoReqStatusFilter;
    });

    // Status action buttons for admin
    const renderDonationStatusActions = (don) => {
        const statuses = ["PENDING", "ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"];
        const currentIdx = statuses.indexOf(don.status);
        return (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {don.status !== "COMPLETED" && currentIdx < statuses.length - 1 && (
                    <button
                        className="action-btn success small"
                        onClick={() => handleUpdateDonationStatus(don.id, statuses[currentIdx + 1])}
                    >
                        → {statuses[currentIdx + 1].replace("_", " ")}
                    </button>
                )}
                {don.status !== "COMPLETED" && (
                    <button
                        className="action-btn danger small"
                        onClick={() => handleUpdateDonationStatus(don.id, "COMPLETED")}
                    >
                        Close
                    </button>
                )}
            </div>
        );
    };

    const renderNgoReqStatusActions = (req) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {req.status === "PENDING" && (
                    <>
                        <button className="action-btn success small" onClick={() => handleUpdateNgoRequestStatus(req.id, "ACCEPTED")}>
                            ✓ Approve
                        </button>
                        <button className="action-btn danger small" onClick={() => handleUpdateNgoRequestStatus(req.id, "COMPLETED")}>
                            ✕ Deny
                        </button>
                    </>
                )}
                {req.status === "ACCEPTED" && (
                    <button className="action-btn success small" onClick={() => handleUpdateNgoRequestStatus(req.id, "COMPLETED")}>
                        ✔️ Mark Completed
                    </button>
                )}
                {req.status === "COMPLETED" && (
                    <span style={{ color: '#6A9C89', fontWeight: '600', fontSize: '0.85rem' }}>✅ Closed</span>
                )}
            </div>
        );
    };

    return (
        <div className="admin-dashboard-container">
            <aside className="admin-sidebar">
                <div className="sidebar-top">
                    <h2 className="logo">
                        <span className="logo-icon">👑</span> Control Center
                    </h2>
                    <nav className="menu">
                        <a className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            <i className="icon">📊</i> Overview
                        </a>
                        <a className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                            <i className="icon">👥</i> User Management
                        </a>
                        <a className={activeTab === 'donations' ? 'active' : ''} onClick={() => setActiveTab('donations')}>
                            <i className="icon">📦</i> All Donations
                        </a>
                        <a className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                            <i className="icon">📝</i> NGO Requests
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
                        <div className="avatar admin-avatar">{profileData.name?.charAt(0)?.toUpperCase() || "A"}</div>
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
                    <h1>Welcome back, {profileData.name} ⚡</h1>
                    <p className="subtitle">Manage users, oversee operations, and handle systemic requests.</p>
                </header>

                <div className="dashboard-scrollable-content">
                    {/* ─── DASHBOARD OVERVIEW ─── */}
                    {activeTab === 'dashboard' && (
                        <div className="tab-content fade-in">
                            <div className="stats-grid stats-grid-4">
                                <div className="stat-card">
                                    <div className="stat-icon purple">👥</div>
                                    <div className="stat-info">
                                        <h3>Total Users</h3>
                                        <p className="stat-number">{stats.totalUsers}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green">🤲</div>
                                    <div className="stat-info">
                                        <h3>Donors</h3>
                                        <p className="stat-number">{stats.totalDonors}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon pink">🏢</div>
                                    <div className="stat-info">
                                        <h3>NGOs</h3>
                                        <p className="stat-number">{stats.totalNgos}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange">📦</div>
                                    <div className="stat-info">
                                        <h3>Total Donations</h3>
                                        <p className="stat-number">{stats.totalDonations}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <div className="section-card" style={{ gridColumn: '1 / -1' }}>
                                    <div className="section-header">
                                        <h2>Platform Overview</h2>
                                    </div>
                                    <div className="system-health">
                                        <div className="health-item">
                                            <span>🤲 Registered Donors</span>
                                            <strong style={{marginLeft: 'auto'}}>{stats.totalDonors}</strong>
                                        </div>
                                        <div className="health-item">
                                            <span>🏢 Registered NGOs</span>
                                            <strong style={{marginLeft: 'auto'}}>{stats.totalNgos}</strong>
                                        </div>
                                        <div className="health-item">
                                            <span>📦 Total Donations</span>
                                            <strong style={{marginLeft: 'auto'}}>{stats.totalDonations}</strong>
                                        </div>
                                        <div className="health-item">
                                            <span>⏳ Pending Donations</span>
                                            <span className="status pending" style={{marginLeft: 'auto'}}>{stats.pendingDonations}</span>
                                        </div>
                                        <div className="health-item">
                                            <span>📝 Total NGO Requests</span>
                                            <strong style={{marginLeft: 'auto'}}>{stats.totalNgoRequests}</strong>
                                        </div>
                                        <div className="health-item">
                                            <span>🔔 Pending NGO Requests</span>
                                            <span className="status pending" style={{marginLeft: 'auto'}}>{stats.pendingNgoRequests}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── USER MANAGEMENT ─── */}
                    {activeTab === 'users' && (
                        <div className="tab-content fade-in">
                            <div className="section-card" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                                <div className="section-header">
                                    <h2>User Management ({filteredUsers.length})</h2>
                                    <div className="filter-group">
                                        <select className="filter-select" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                                            <option value="ALL">All Roles</option>
                                            <option value="DONOR">Donors Only</option>
                                            <option value="NGO">NGOs Only</option>
                                            <option value="ADMIN">Admins Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Joined</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr><td colSpan="6" style={{textAlign:'center',color:'#6A9C89'}}>No users found.</td></tr>
                                            ) : (
                                                filteredUsers.map(user => (
                                                    <tr key={user.id}>
                                                        <td className="font-medium">{user.name}</td>
                                                        <td>
                                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="text-muted">{user.email}</td>
                                                        <td className="text-muted">{user.phone || "—"}</td>
                                                        <td className="text-muted">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                                                        <td>
                                                            {user.role !== "ADMIN" ? (
                                                                <button
                                                                    className="action-btn danger small"
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            ) : (
                                                                <span style={{color:'#6A9C89', fontSize:'0.85rem'}}>—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── ALL DONATIONS ─── */}
                    {activeTab === 'donations' && (
                        <div className="tab-content fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>All Donations ({filteredDonations.length})</h2>
                                <select className="filter-select" value={donationStatusFilter} onChange={e => setDonationStatusFilter(e.target.value)}>
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="PICKED_UP">Picked Up</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            <div className="card-list">
                                {filteredDonations.length === 0 ? (
                                    <p className="placeholder-text">No donations found.</p>
                                ) : (
                                    filteredDonations.map(don => (
                                        <div className="item-card system-card" key={don.id}>
                                            <div className="card-top">
                                                <h4>🍽️ {don.foodType}</h4>
                                                <span className={`status ${statusClass(don.status)}`}>{don.status}</span>
                                            </div>
                                            <div className="card-body mt-2">
                                                <p><strong>Donor:</strong> <span className="highlight-text">{don.donorName}</span></p>
                                                <p><strong>Email:</strong> <span className="text-muted">{don.donorEmail}</span></p>
                                                <p><strong>Quantity:</strong> {don.quantity}</p>
                                                <p><strong>Location:</strong> {don.location}</p>
                                                <p><strong>Description:</strong> {don.description || "—"}</p>
                                                <p><strong>Expiry:</strong> {don.expiryTime ? new Date(don.expiryTime).toLocaleString() : "—"}</p>
                                                <p className="text-muted text-sm">{timeAgo(don.createdAt)}</p>
                                            </div>
                                            {renderDonationStatusActions(don)}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── ALL NGO REQUESTS ─── */}
                    {activeTab === 'requests' && (
                        <div className="tab-content fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>NGO Requests ({filteredNgoRequests.length})</h2>
                                <select className="filter-select" value={ngoReqStatusFilter} onChange={e => setNgoReqStatusFilter(e.target.value)}>
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            <div className="card-list">
                                {filteredNgoRequests.length === 0 ? (
                                    <p className="placeholder-text">No NGO requests found.</p>
                                ) : (
                                    filteredNgoRequests.map(req => (
                                        <div className="item-card system-card" key={req.id}>
                                            <div className="card-top">
                                                <h4>📋 {req.title}</h4>
                                                <span className={`status ${statusClass(req.status)}`}>{req.status}</span>
                                            </div>
                                            <div className="card-body mt-2">
                                                <p><strong>NGO:</strong> <span className="highlight-text">{req.ngoName}</span></p>
                                                <p><strong>Email:</strong> <span className="text-muted">{req.ngoEmail}</span></p>
                                                <p><strong>Quantity:</strong> {req.quantity}</p>
                                                <p><strong>Urgency:</strong> {urgencyLabel(req.urgency)}</p>
                                                <p><strong>Description:</strong> {req.description || "—"}</p>
                                                <p className="text-muted text-sm">{timeAgo(req.createdAt)}</p>
                                            </div>
                                            {renderNgoReqStatusActions(req)}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── PROFILE ─── */}
                    {activeTab === 'profile' && (
                        <div className="tab-content fade-in">
                            <div className="form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ margin: 0 }}>Admin Profile</h2>
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
                                            <label>Role <span style={{fontSize:'0.8rem',color:'#999'}}>(cannot be changed)</span></label>
                                            <input type="text" value={profileData.role} readOnly style={{backgroundColor: '#C4DAD2', cursor: 'not-allowed', color: '#6A9C89'}} />
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
                                            <label>Email Address <span style={{fontSize:'0.8rem',color:'#999'}}>(cannot be changed)</span></label>
                                            <input type="email" value={profileData.email} readOnly style={{backgroundColor: '#C4DAD2', cursor: 'not-allowed', color: '#6A9C89'}} />
                                        </div>
                                        <div className="form-group">
                                            <label>Password <span style={{fontSize:'0.8rem',color:'#999'}}>(cannot be changed)</span></label>
                                            <input type="password" value="••••••••" readOnly style={{backgroundColor: '#C4DAD2', cursor: 'not-allowed', color: '#6A9C89'}} />
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

export default AdminDashboard;
