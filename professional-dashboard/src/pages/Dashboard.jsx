import { useEffect, useState } from "react";
import { ClipboardList, CheckCheck, RefreshCw, XCircle, DollarSign, Clock } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://service-marketplace-af7p.onrender.com/api/professionals/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("professionalToken")}` }
      });
      if (!response.ok) throw new Error("Failed to load dashboard");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><RefreshCw className="spin" size={32} color="var(--text-muted)" /></div>;
  if (error) return <div className="section-container" style={{ color: "var(--error)", textAlign: "center" }}><XCircle size={40} style={{ margin: "0 auto 12px" }} /><p>Error: {error}</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Professional Dashboard</h1>
        <p className="page-subtitle">Welcome back. Here is your overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-header">
            <div>
              <div className="stat-title">Total Requests</div>
              <div className="stat-value">{stats?.total_requests || 0}</div>
            </div>
            <div className="stat-icon"><ClipboardList size={24} /></div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div>
              <div className="stat-title">Pending</div>
              <div className="stat-value">{stats?.pending_requests || 0}</div>
            </div>
            <div className="stat-icon"><Clock size={24} /></div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div>
              <div className="stat-title">Completed</div>
              <div className="stat-value">{stats?.completed_requests || 0}</div>
            </div>
            <div className="stat-icon"><CheckCheck size={24} /></div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div>
              <div className="stat-title">Estimated Earnings</div>
              <div className="stat-value">₹{stats?.total_earnings || 0}</div>
            </div>
            <div className="stat-icon"><DollarSign size={24} /></div>
          </div>
        </div>
      </div>
      
      <div className="section-container">
        <h2>Recent Activity</h2>
        <p style={{ color: "var(--text-muted)" }}>Your recent notifications and updates will appear here.</p>
      </div>
    </div>
  );
}

export default Dashboard;
