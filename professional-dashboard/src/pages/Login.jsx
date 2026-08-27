import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatusMessage("");
    try {
      const response = await fetch("https://service-marketplace-af7p.onrender.com/api/professionals/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (response.status === 403 && result.status === "pending") {
        setStatusMessage("Status: Pending admin approval. The dashboard will be available after the admin accepts your registration.");
        return;
      }
      if (!response.ok) throw new Error(result.message || "Unable to log in");
      localStorage.setItem("professionalToken", result.token);
      localStorage.setItem("professional", JSON.stringify(result.professional));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <div className="registration-wrapper">
    <div className="registration-card login-card">
      <div className="brand-header">
        <div className="brand-icon"><Briefcase size={24} /></div>
        <h1>Professional Login</h1>
        <p>Sign in to manage your services.</p>
      </div>
      {error && <div className="auth-error">{error}</div>}
      {statusMessage && <div className="auth-status">{statusMessage}</div>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group full-width"><label>Email</label><input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-group full-width"><label>Password</label><input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="submit-btn" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
      </form>
      <p className="auth-switch">New professional? <Link to="/register">Create an account</Link></p>
    </div>
  </div>;
}

