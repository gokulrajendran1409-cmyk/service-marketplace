import { useEffect, useState } from "react";
import {
  Tags,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  Home,
  Shield,
  Car,
  Leaf,
  Monitor,
  Camera,
  RefreshCw,
  XCircle,
  UserCheck,
  Users,
} from "lucide-react";

// Map category name → icon + gradient
const CATEGORY_STYLE = {
  "Plumbing":                  { icon: <Wrench size={22} />,    from: "#3b82f6", to: "#1d4ed8" },
  "Electrical":                { icon: <Zap size={22} />,       from: "#f59e0b", to: "#d97706" },
  "AC & Appliance Repair":     { icon: <Wind size={22} />,      from: "#06b6d4", to: "#0891b2" },
  "Carpentry":                 { icon: <Hammer size={22} />,    from: "#a16207", to: "#92400e" },
  "Painting":                  { icon: <Paintbrush size={22} />,from: "#ec4899", to: "#be185d" },
  "Cleaning":                  { icon: <Sparkles size={22} />,  from: "#8b5cf6", to: "#6d28d9" },
  "Home Repair & Maintenance": { icon: <Home size={22} />,      from: "#f97316", to: "#c2410c" },
  "CCTV & Security":           { icon: <Shield size={22} />,    from: "#6366f1", to: "#4338ca" },
  "Vehicle Services":          { icon: <Car size={22} />,       from: "#64748b", to: "#334155" },
  "Gardening & Landscaping":   { icon: <Leaf size={22} />,      from: "#10b981", to: "#047857" },
  "Computer & Mobile Repair":  { icon: <Monitor size={22} />,   from: "#0ea5e9", to: "#0369a1" },
  "Photography & Videography": { icon: <Camera size={22} />,    from: "#d946ef", to: "#a21caf" },
};

const DEFAULT_STYLE = { icon: <Tags size={22} />, from: "#6366f1", to: "#4f46e5" };

function CategoryCard({ cat }) {
  const style = CATEGORY_STYLE[cat.name] || DEFAULT_STYLE;
  const total = Number(cat.total_professionals) || 0;
  const verified = Number(cat.verified_count) || 0;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 32px -4px ${style.from}33`;
        e.currentTarget.style.borderColor = `${style.from}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border-light)";
      }}
    >
      {/* Decorative background blob */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${style.from}18, ${style.to}10)`,
          pointerEvents: "none",
        }}
      />

      {/* Header: icon + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
            boxShadow: `0 4px 12px ${style.from}44`,
          }}
        >
          {style.icon}
        </div>
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "2px",
              lineHeight: 1.3,
            }}
          >
            {cat.name}
          </h3>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            ID #{cat.id}
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "13.5px",
          color: "var(--text-secondary)",
          lineHeight: "1.6",
          flexGrow: 1,
        }}
      >
        {cat.description || "No description available."}
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "10px",
            background: "var(--bg-base)",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#6366f1" }}>
            <Users size={14} />
            <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
              {total}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
            Total Pros
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "10px",
            background: "rgba(16,185,129,0.06)",
            borderRadius: "10px",
            border: "1px solid rgba(16,185,129,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#10b981" }}>
            <UserCheck size={14} />
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#10b981" }}>
              {verified}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Totals
  const totalPros = categories.reduce((s, c) => s + Number(c.total_professionals), 0);
  const totalVerified = categories.reduce((s, c) => s + Number(c.verified_count), 0);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          gap: "16px",
          color: "var(--text-muted)",
        }}
      >
        <RefreshCw size={32} style={{ animation: "spin 1s linear infinite" }} />
        <p>Loading categories…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="section-container"
        style={{ color: "var(--error)", textAlign: "center", padding: "40px" }}
      >
        <XCircle size={40} style={{ margin: "0 auto 12px" }} />
        <p style={{ fontWeight: "600" }}>Error: {error}</p>
        <button
          onClick={() => fetchCategories()}
          style={{
            marginTop: "16px",
            background: "var(--error)",
            color: "white",
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
        }}
      >
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Service Categories</h1>
          <p className="page-subtitle">
            All service categories available on the platform and their registered professionals.
          </p>
        </div>
        <button
          onClick={() => fetchCategories(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: "500",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <RefreshCw
            size={16}
            style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
          />
          Refresh
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      {/* Summary Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            label: "Total Categories",
            value: categories.length,
            color: "#6366f1",
            icon: <Tags size={20} />,
          },
          {
            label: "Total Professionals",
            value: totalPros,
            color: "#f59e0b",
            icon: <Users size={20} />,
          },
          {
            label: "Verified Professionals",
            value: totalVerified,
            color: "#10b981",
            icon: <UserCheck size={20} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <div className="stat-title" style={{ marginBottom: "6px" }}>{s.label}</div>
              <div className="stat-value" style={{ fontSize: "28px", color: s.color }}>{s.value}</div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `${s.color}18`,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Category Cards Grid */}
      {categories.length === 0 ? (
        <div
          className="section-container"
          style={{ textAlign: "center", padding: "60px 40px" }}
        >
          <Tags size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
          <h3 style={{ marginBottom: "8px" }}>No categories found</h3>
          <p style={{ color: "var(--text-muted)" }}>
            No categories have been added to the database yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </div>
  );
}