import { useEffect, useState, useMemo } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  Ban,
  User,
  UserCog,
  Calendar,
  RefreshCw,
  Inbox,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    icon: <Clock size={14} />,
  },
  accepted: {
    label: "Accepted",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.1)",
    icon: <CheckCircle size={14} />,
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
    icon: <CheckCheck size={14} />,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    icon: <XCircle size={14} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.1)",
    icon: <Ban size={14} />,
  },
};

const TABS = [
  { key: "all", label: "All Requests" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: cfg.bg,
        color: cfg.color,
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function SummaryCard({ label, value, color, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}18` : "var(--bg-surface)",
        border: `1px solid ${active ? color : "var(--border-light)"}`,
        borderRadius: "14px",
        padding: "20px 24px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        boxShadow: active ? `0 0 0 3px ${color}22` : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: active ? color : "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: `${color}18`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </span>
      </div>
      <span
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: active ? color : "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </button>
  );
}

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/service-requests"
      );
      if (!res.ok) throw new Error("Failed to fetch service requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const stream = new EventSource("http://localhost:5000/api/admin/notifications/stream");
    const refreshForRequestEvent = () => fetchRequests(true);
    stream.addEventListener("service_request_created", refreshForRequestEvent);
    stream.addEventListener("service_request_updated", refreshForRequestEvent);
    return () => stream.close();
  }, []);

  // Count per status
  const counts = useMemo(() => {
    const c = { all: requests.length };
    for (const r of requests) {
      c[r.status] = (c[r.status] || 0) + 1;
    }
    return c;
  }, [requests]);

  // Filtered list
  const filtered = useMemo(() =>
    activeTab === "all" ? requests : requests.filter((r) => r.status === activeTab),
    [requests, activeTab]
  );

  const tabStyle = (key) => ({
    padding: "9px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
    background: activeTab === key ? "var(--accent-primary)" : "transparent",
    color: activeTab === key ? "white" : "var(--text-secondary)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  });

  const countBadge = (key) => {
    const n = counts[key] || 0;
    if (!n) return null;
    const cfg = STATUS_CONFIG[key];
    return (
      <span
        style={{
          padding: "1px 7px",
          borderRadius: "10px",
          fontSize: "11px",
          background:
            activeTab === key
              ? "rgba(255,255,255,0.25)"
              : cfg
              ? cfg.bg
              : "var(--bg-base)",
          color: activeTab === key ? "white" : cfg ? cfg.color : "var(--text-muted)",
        }}
      >
        {n}
      </span>
    );
  };

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
        <p>Loading service requests…</p>
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
          onClick={() => fetchRequests()}
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
          marginBottom: "32px",
        }}
      >
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Service Requests</h1>
          <p className="page-subtitle">
            Monitor all service requests — pending, accepted, completed, or
            rejected.
          </p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
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
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />
          Refresh
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <SummaryCard
          label="Total"
          value={counts.all || 0}
          color="#6366f1"
          icon={<ClipboardList size={16} />}
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        />
        <SummaryCard
          label="Pending"
          value={counts.pending || 0}
          color="#f59e0b"
          icon={<Clock size={16} />}
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        />
        <SummaryCard
          label="Accepted"
          value={counts.accepted || 0}
          color="#6366f1"
          icon={<CheckCircle size={16} />}
          active={activeTab === "accepted"}
          onClick={() => setActiveTab("accepted")}
        />
        <SummaryCard
          label="Completed"
          value={counts.completed || 0}
          color="#10b981"
          icon={<CheckCheck size={16} />}
          active={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        />
        <SummaryCard
          label="Rejected"
          value={counts.rejected || 0}
          color="#ef4444"
          icon={<XCircle size={16} />}
          active={activeTab === "rejected"}
          onClick={() => setActiveTab("rejected")}
        />
        <SummaryCard
          label="Cancelled"
          value={counts.cancelled || 0}
          color="#94a3b8"
          icon={<Ban size={16} />}
          active={activeTab === "cancelled"}
          onClick={() => setActiveTab("cancelled")}
        />
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          padding: "6px",
          background: "var(--bg-surface)",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          width: "fit-content",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={tabStyle(tab.key)}
          >
            {tab.label}
            {countBadge(tab.key)}
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div
          className="section-container"
          style={{ textAlign: "center", padding: "60px 40px" }}
        >
          <Inbox
            size={48}
            style={{ color: "var(--text-muted)", margin: "0 auto 16px" }}
          />
          <h3 style={{ marginBottom: "8px" }}>No requests found</h3>
          <p style={{ color: "var(--text-muted)" }}>
            {activeTab === "all"
              ? "No service requests have been created yet."
              : `There are no ${activeTab} requests right now.`}
          </p>
        </div>
      ) : (
        <div className="section-container" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 1fr 1fr 120px 160px",
              gap: "0",
              padding: "14px 24px",
              borderBottom: "1px solid var(--border-light)",
              background: "var(--bg-base)",
            }}
          >
            {["#", "Customer", "Professional", "Service / Description", "Status", "Date"].map(
              (h) => (
                <span
                  key={h}
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    color: "var(--text-muted)",
                  }}
                >
                  {h}
                </span>
              )
            )}
          </div>

          {/* Table Rows */}
          {filtered.map((req, idx) => (
            <div
              key={req.id}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 1fr 1fr 120px 160px",
                gap: "0",
                padding: "18px 24px",
                borderBottom:
                  idx !== filtered.length - 1
                    ? "1px solid var(--border-light)"
                    : "none",
                alignItems: "center",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* # */}
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                }}
              >
                #{req.id}
              </span>

              {/* Customer */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {req.user_name || "—"}
                  </div>
                  {req.user_email && (
                    <div
                      style={{ fontSize: "12px", color: "var(--text-muted)" }}
                    >
                      {req.user_email}
                    </div>
                  )}
                </div>
              </div>

              {/* Professional */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <UserCog size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {req.professional_name
                      || (req.status === "pending" && req.offer_count > 1
                        ? "Multiple nearby professionals"
                        : req.status === "pending"
                          ? "Awaiting professional acceptance"
                          : req.status === "cancelled" && req.rejected_professionals
                            ? `Rejected by: ${req.rejected_professionals}`
                          : "—")}
                  </div>
                  {req.professional_category && (
                    <div
                      style={{ fontSize: "12px", color: "var(--text-muted)" }}
                    >
                      {req.professional_category}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: "8px",
                }}
                title={[req.title, req.description, req.location].filter(Boolean).join(" — ")}
              >
                <strong style={{ color: "var(--text-primary)" }}>{req.title || "Service request"}</strong>
                {req.description && <span> — {req.description}</span>}
                {req.location && <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>{req.location}</span>}
                {req.requested_at && <span style={{ display: "block", fontSize: "12px", color: "var(--accent-primary)", marginTop: "3px" }}>Professional expected: {new Date(req.requested_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>}
              </span>

              {/* Status */}
              <StatusBadge status={req.status} />

              {/* Date */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                  {new Date(req.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Footer count */}
          <div
            style={{
              padding: "12px 24px",
              borderTop: "1px solid var(--border-light)",
              background: "var(--bg-base)",
              fontSize: "13px",
              color: "var(--text-muted)",
            }}
          >
            Showing <strong style={{ color: "var(--text-secondary)" }}>{filtered.length}</strong>{" "}
            {activeTab === "all" ? "total" : activeTab} request{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
