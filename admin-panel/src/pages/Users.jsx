import { useEffect, useState } from "react";
import { Calendar, Mail, Phone, RefreshCw, User, UsersRound, XCircle } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchUsers = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load users");
      setUsers(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <div className="section-container" style={{ textAlign: "center", padding: 48 }}><RefreshCw className="spin" size={28} /><p>Loading users...</p></div>;
  if (error) return <div className="section-container" style={{ color: "var(--error)", textAlign: "center", padding: 48 }}><XCircle size={36} /><p>{error}</p><button onClick={fetchUsers}>Retry</button></div>;

  return <div>
    <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div><h1 className="page-title">Customers</h1><p className="page-subtitle">All customer accounts registered on ServiceHub.</p></div>
      <button onClick={fetchUsers} className="action-btn" title="Refresh users"><RefreshCw size={18} /></button>
    </div>
    <div className="section-container" style={{ padding: 0, overflow: "hidden" }}>
      {users.length === 0 ? <div style={{ textAlign: "center", padding: 56, color: "var(--text-muted)" }}><UsersRound size={42} /><h3>No customers yet</h3><p>Customer accounts will appear here after registration.</p></div> : <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)", fontSize: 14 }}><strong>{users.length}</strong> customer{users.length === 1 ? "" : "s"}</div>
        {users.map((user, index) => <div key={user.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 130px 120px", gap: 16, alignItems: "center", padding: "18px 24px", borderBottom: index === users.length - 1 ? "none" : "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(99,102,241,.12)", color: "var(--accent-primary)" }}><User size={16} /></span><strong>{user.name}</strong></div>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}><Mail size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />{user.email}</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}><Phone size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />{user.phone || "—"}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}><Calendar size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />{new Date(user.created_at).toLocaleDateString("en-IN")}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-primary)" }}>{user.service_request_count} request{user.service_request_count === 1 ? "" : "s"}</span>
        </div>)}
      </>}
    </div>
  </div>;
}
