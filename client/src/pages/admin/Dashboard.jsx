import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");

    // Mock statistics
    const stats = {
        totalDonors: 1420,
        totalNGOs: 350,
        totalRequests: 85,
    };

    // Mock user management data
    const [users, setUsers] = useState([
        { id: 1, name: "John Doe", email: "john@example.com", role: "DONOR", isActive: true, joinedAt: "Oct 12, 2023" },
        { id: 2, name: "Hope Foundation", email: "contact@hope.org", role: "NGO", isActive: true, joinedAt: "Nov 01, 2023" },
        { id: 3, name: "Jane Smith", email: "jane@example.com", role: "DONOR", isActive: false, joinedAt: "Jan 15, 2024" },
        { id: 4, name: "City Food Bank", email: "info@cityfood.org", role: "NGO", isActive: true, joinedAt: "Feb 20, 2024" },
        { id: 5, name: "Tech Solutions Inc.", email: "csr@techsol.com", role: "DONOR", isActive: true, joinedAt: "Mar 05, 2024" }
    ]);

    // Mock pending requests data
    const [ngoRequests, setNgoRequests] = useState([
        { id: 101, title: "Emergency Flood Relief", ngoName: "Hope Foundation", targetAmount: "5000 Meals", date: "Today, 10:00 AM" },
        { id: 102, title: "Winter Blankets Distribution", ngoName: "Warm Hearts", targetAmount: "1000 Blankets", date: "Yesterday" },
        { id: 103, title: "School Lunch Program Expansion", ngoName: "City Food Bank", targetAmount: "2000 Meals", date: "Oct 22, 2023" }
    ]);

    const toggleUserStatus = (id) => {
        setUsers(users.map(user => 
            user.id === id ? { ...user, isActive: !user.isActive } : user
        ));
    };

    const handleAcceptRequest = (id) => {
        setNgoRequests(ngoRequests.filter(req => req.id !== id));
    };

    const handleDenyRequest = (id) => {
        setNgoRequests(ngoRequests.filter(req => req.id !== id));
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
                        <a className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                            <i className="icon">📝</i> NGO Requests
                        </a>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="user-info">
                        <div className="avatar admin-avatar">A</div>
                        <div className="user-details">
                            <p className="user-name">System Admin</p>
                            <p className="user-role">Superuser</p>
                        </div>
                        <button className="logout-btn" title="Logout" onClick={() => navigate('/landing')}>
                            ⎋
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Admin Dashboard ⚡</h1>
                    <p className="subtitle">Manage users, oversee operations, and handle systemic requests.</p>
                </header>

                <div className="dashboard-scrollable-content">
                    {/* Dashboard Overview Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="tab-content fade-in">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon purple">👥</div>
                                    <div className="stat-info">
                                        <h3>Registered Donors</h3>
                                        <p className="stat-number">{stats.totalDonors}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon pink">🏢</div>
                                    <div className="stat-info">
                                        <h3>Registered NGOs</h3>
                                        <p className="stat-number">{stats.totalNGOs}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange">🔔</div>
                                    <div className="stat-info">
                                        <h3>Pending NGO Requests</h3>
                                        <p className="stat-number">{stats.totalRequests}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <div className="recent-activity section-card" style={{ gridColumn: '1 / -1' }}>
                                    <div className="section-header">
                                        <h2>System Resource Overview</h2>
                                    </div>
                                    <div className="system-health">
                                        <div className="health-item">
                                            <span>Server Status</span>
                                            <span className="status completed">Online</span>
                                        </div>
                                        <div className="health-item">
                                            <span>Database Load</span>
                                            <span className="status pending">Moderate</span>
                                        </div>
                                        <div className="health-item">
                                            <span>Active Sessions</span>
                                            <strong style={{marginLeft: 'auto'}}>342</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Management Tab */}
                    {activeTab === 'users' && (
                        <div className="tab-content fade-in">
                            <div className="section-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div className="section-header">
                                    <h2>User Management Directory</h2>
                                    <div className="filter-group">
                                        <select className="filter-select">
                                            <option>All Roles</option>
                                            <option>Donors Only</option>
                                            <option>NGOs Only</option>
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
                                                <th>Status</th>
                                                <th>Joined</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id} className={user.isActive ? "" : "inactive-row"}>
                                                    <td className="font-medium">{user.name}</td>
                                                    <td>
                                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">{user.email}</td>
                                                    <td>
                                                        <span className={`status ${user.isActive ? 'completed' : 'danger-status'}`}>
                                                            {user.isActive ? 'Active' : 'Deactivated'}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">{user.joinedAt}</td>
                                                    <td>
                                                        <button 
                                                            className={`action-btn small ${user.isActive ? 'danger' : 'success'}`}
                                                            onClick={() => toggleUserStatus(user.id)}
                                                        >
                                                            {user.isActive ? 'Deactivate' : 'Reactivate'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NGO Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="tab-content fade-in">
                            <div className="section-header" style={{ maxWidth: '1000px', margin: '0 auto 2rem auto' }}>
                                <h2>Pending NGO Requests & Appeals</h2>
                                <p className="subtitle" style={{marginTop: '0.5rem'}}>Review and authorize requests that NGOs were unable to process directly.</p>
                            </div>
                            
                            <div className="card-list" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                {ngoRequests.length === 0 ? (
                                    <p className="placeholder-text">No pending NGO requests in the queue.</p>
                                ) : (
                                    ngoRequests.map(req => (
                                        <div className="item-card system-card" key={req.id}>
                                            <div className="card-top">
                                                <h4>{req.title}</h4>
                                                <span className="date-badge">{req.date}</span>
                                            </div>
                                            <div className="card-body mt-3">
                                                <p><strong>Applying NGO:</strong> <span className="highlight-text">{req.ngoName}</span></p>
                                                <p><strong>Target/Resource:</strong> {req.targetAmount}</p>
                                                <p className="text-muted text-sm mt-2">
                                                    Reason for escalation: Current resources insufficient to meet the target capacity within the specified timeframe.
                                                </p>
                                            </div>
                                            <div className="card-actions mt-4 border-top pt-3">
                                                <button 
                                                    className="action-btn success full-width"
                                                    onClick={() => handleAcceptRequest(req.id)}
                                                >
                                                    ✓ Authorize & Allocate
                                                </button>
                                                <button 
                                                    className="action-btn danger full-width mt-2"
                                                    onClick={() => handleDenyRequest(req.id)}
                                                >
                                                    ✕ Deny Request
                                                </button>
                                            </div>
                                        </div>
                                    ))
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
