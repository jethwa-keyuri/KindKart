import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function NgoDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "Hope Foundation",
        role: "Registered NGO",
        phone: "+1 987 654 3210",
        address: "456 Charity Lane, Metropolis",
        email: "contact@hopefoundation.org",
        password: "password123"
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = () => {
        setIsEditingProfile(false);
    };

    const [incomingRequests, setIncomingRequests] = useState([
        { id: 1, title: "50 Meals donation offer", donor: "John Doe", foodType: "Cooked Meals", status: "Pending" },
        { id: 2, title: "Canned Goods", donor: "Local Supermarket", foodType: "Non-perishables", status: "Pending" }
    ]);

    const handleAcceptRequest = (id) => {
        setIncomingRequests(incomingRequests.filter(req => req.id !== id));
    };

    const handleDenyRequest = (id) => {
        setIncomingRequests(incomingRequests.filter(req => req.id !== id));
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
                        {/*<a className={activeTab === 'campaigns' ? 'active' : ''} onClick={() => setActiveTab('campaigns')}>
                             Active Campaigns
                        </a>*/}
                        <a className={activeTab === 'donations' ? 'active' : ''} onClick={() => setActiveTab('donations')}>
                             Received Donations
                        </a>
                        <a className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                             Manage Requests
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
                        <div className="avatar ngo-avatar">H</div>
                        <div className="user-details">
                            <p className="user-name">Hope Foundation</p>
                            <p className="user-role">Registered NGO</p>
                        </div>
                        <button className="logout-btn" title="Logout" onClick={() => navigate('/landing')}>
                            ⎋
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Welcome back, Hope Foundation! 🌟</h1>
                    <p className="subtitle">Track your campaigns and managing incoming distributions.</p>
                </header>

                <div className="dashboard-scrollable-content">
                    {activeTab === 'dashboard' && (
                        <div className="tab-content fade-in">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon green">🌍</div>
                                    <div className="stat-info">
                                        <h3>Lives Impacted</h3>
                                        <p className="stat-number">5,230</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange">🍲</div>
                                    <div className="stat-info">
                                        <h3>Meals Distributed</h3>
                                        <p className="stat-number">12.4k</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon blue">📦</div>
                                    <div className="stat-info">
                                        <h3>Active Requests</h3>
                                        <p className="stat-number">8</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <div className="recent-activity section-card">
                                    <div className="section-header">
                                        <h2>Recent Donations Received</h2>
                                        <button className="view-all-btn">View All</button>
                                    </div>
                                    <ul className="activity-list">
                                        <li className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div className="activity-details">
                                                <p className="activity-title">50 Meals from Donor User</p>
                                                <p className="activity-time">2 hours ago</p>
                                            </div>
                                            <span className="status completed">Received</span>
                                        </li>
                                        <li className="activity-item">
                                            <div className="activity-dot pending"></div>
                                            <div className="activity-details">
                                                <p className="activity-title">Winter Clothes Bundle</p>
                                                <p className="activity-time">Pending Delivery - Today, 4 PM</p>
                                            </div>
                                            <span className="status pending">In Transit</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="quick-actions section-card">
                                    <h2>Quick Actions</h2>
                                    <div className="action-buttons">
                                        <button className="action-btn primary" onClick={() => setActiveTab('requests')}>
                                            + Post New Request
                                        </button>
                                        <button className="action-btn secondary">
                                            Update Donors
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'campaigns' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <h2>Create Campaign</h2>
                                <form className="dashboard-form">
                                    <div className="form-group">
                                        <label>Campaign Title</label>
                                        <input type="text" placeholder="e.g. Winter Relief Drive" />
                                    </div>
                                    <div className="form-group">
                                        <label>Goal Description</label>
                                        <textarea placeholder="What are you trying to achieve?"></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Target Date</label>
                                        <input type="date" />
                                    </div>
                                    <button type="button" className="action-btn primary">Launch Campaign</button>
                                </form>
                            </div>
                            <h2 style={{marginTop: '2rem'}}>Active Campaigns</h2>
                            <div className="card-list">
                                <div className="item-card">
                                    <h4>Summer Food Drive</h4>
                                    <p><strong>Status:</strong> <span className="status completed">Active</span></p>
                                    <p><strong>Goal:</strong> 5000 Meals</p>
                                    <p><strong>Raised:</strong> 3200 Meals</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'donations' && (
                        <div className="tab-content fade-in">
                            <h2>Received Donations</h2>
                            <div className="card-list">
                                <div className="item-card">
                                    <h4>50 Meals from Donor User</h4>
                                    <p><strong>Food Type:</strong> Mixed Meals</p>
                                    <p><strong>Quantity:</strong> 50 servings</p>
                                    <p><strong>Status:</strong> <span className="status completed">Received</span></p>
                                    <p><strong>Date:</strong> Oct 24, 2023</p>
                                </div>
                                <div className="item-card">
                                    <h4>Canned Beans Collection</h4>
                                    <p><strong>Food Type:</strong> Canned goods</p>
                                    <p><strong>Quantity:</strong> 100 cans</p>
                                    <p><strong>Status:</strong> <span className="status completed">Received</span></p>
                                    <p><strong>Date:</strong> Oct 22, 2023</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'requests' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <h2>Create Request</h2>
                                <form className="dashboard-form">
                                    <div className="form-group">
                                        <label>Food Type Needed</label>
                                        <input type="text" placeholder="e.g. Fresh Produce, Non-perishables" />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity Required</label>
                                        <input type="text" placeholder="e.g. 100 servings" />
                                    </div>
                                    <div className="form-group">
                                        <label>Urgency Level</label>
                                        <select>
                                            <option>High (Next 24 hrs)</option>
                                            <option>Medium (Next 3 days)</option>
                                            <option>Low (This week)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea placeholder="Why is this needed?"></textarea>
                                    </div>
                                    <button type="button" className="action-btn primary">Post Request</button>
                                </form>
                            </div>
                            <h2 style={{marginTop: '2rem'}}>Manage Incoming Requests</h2>
                            {incomingRequests.length === 0 ? (
                                <p className="placeholder-text" style={{marginTop: '1rem'}}>No incoming requests at the moment.</p>
                            ) : (
                                <div className="card-list">
                                    {incomingRequests.map(req => (
                                        <div className="item-card" key={req.id}>
                                            <h4>{req.title}</h4>
                                            <p><strong>Donor:</strong> {req.donor}</p>
                                            <p><strong>Food Type:</strong> {req.foodType}</p>
                                            <p><strong>Status:</strong> <span className="status pending">{req.status}</span></p>
                                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                                                <button 
                                                    className="action-btn primary small" 
                                                    onClick={() => handleAcceptRequest(req.id)}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="action-btn secondary danger small" 
                                                    onClick={() => handleDenyRequest(req.id)}
                                                >
                                                    Deny
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>NGO Name</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{profileData.name}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Role</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{profileData.role}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Phone Number</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{profileData.phone}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Address / HQ</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{profileData.address}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Email Address</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{profileData.email}</p>
                                        </div>
                                        <div className="detail-group">
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Password</label>
                                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>••••••••</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="dashboard-form">
                                        <div className="form-group">
                                            <label>NGO Name</label>
                                            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <input type="text" name="role" value={profileData.role} readOnly style={{backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b'}} />
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
                                            <label>Email Address</label>
                                            <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input type="password" name="password" value={profileData.password} onChange={handleProfileChange} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button type="button" className="action-btn primary" onClick={handleProfileSave}>Save Changes</button>
                                            <button type="button" className="action-btn secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="tab-content fade-in">
                            <div className="form-card">
                                <h2>NGO Settings</h2>
                                <form className="dashboard-form">
                                    <div className="form-group">
                                        <label>Notification Preferences</label>
                                        <select>
                                            <option>All events</option>
                                            <option>Donations and Messages</option>
                                            <option>Donations only</option>
                                        </select>
                                    </div>
                                    <button type="button" className="action-btn secondary">Update Settings</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default NgoDashboard;
