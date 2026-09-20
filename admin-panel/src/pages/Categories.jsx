import { useEffect, useState, useMemo } from "react";
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
  Search,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { API_URL } from "../services/api";

// Map category name → icon + gradient styling
const CATEGORY_STYLE = {
  "Plumbing":                  { icon: <Wrench size={22} />,    from: "#3b82f6", to: "#1d4ed8" },
  "Electrical":                { icon: <Zap size={22} />,       from: "#f59e0b", to: "#d97706" },
  "AC & Appliances":           { icon: <Wind size={22} />,      from: "#06b6d4", to: "#0891b2" },
  "AC & Appliance Repair":     { icon: <Wind size={22} />,      from: "#06b6d4", to: "#0891b2" },
  "Carpentry":                 { icon: <Hammer size={22} />,    from: "#a16207", to: "#92400e" },
  "Painting":                  { icon: <Paintbrush size={22} />,from: "#ec4899", to: "#be185d" },
  "Cleaning":                  { icon: <Sparkles size={22} />,  from: "#8b5cf6", to: "#6d28d9" },
  "Pest Control":              { icon: <Shield size={22} />,    from: "#ef4444", to: "#b91c1c" },
  "Home Improvement":          { icon: <Home size={22} />,      from: "#f97316", to: "#c2410c" },
  "CCTV & Security":           { icon: <Shield size={22} />,    from: "#6366f1", to: "#4338ca" },
  "Vehicle":                   { icon: <Car size={22} />,       from: "#64748b", to: "#334155" },
  "Vehicle Services":          { icon: <Car size={22} />,       from: "#64748b", to: "#334155" },
  "Gardening & Landscaping":   { icon: <Leaf size={22} />,      from: "#10b981", to: "#047857" },
  "Computer & Mobile Repair":  { icon: <Monitor size={22} />,   from: "#0ea5e9", to: "#0369a1" },
  "Photography & Videography": { icon: <Camera size={22} />,    from: "#d946ef", to: "#a21caf" },
  "Personal & Daily Help":     { icon: <Users size={22} />,     from: "#8b5cf6", to: "#6d28d9" },
  "Personal Care":             { icon: <Sparkles size={22} />,  from: "#ec4899", to: "#be185d" },
};

const DEFAULT_STYLE = { icon: <Tags size={22} />, from: "#6366f1", to: "#4f46e5" };

const PRESET_PRICES = ["From ₹149", "From ₹199", "From ₹249", "From ₹299", "From ₹349", "From ₹399", "From ₹499", "From ₹799", "From ₹999"];

function Toast({ message, type, onClose }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        background: isError ? "#ef4444" : "#10b981",
        color: "#ffffff",
        padding: "14px 20px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 9999,
        animation: "slideInUp 0.3s ease-out",
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#ffffff",
          cursor: "pointer",
          marginLeft: "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Inline editing state for subcategories: { [subcategoryId]: { editing: bool, value: string, saving: bool } }
  const [subEditState, setSubEditState] = useState({});

  // Inline editing state for categories: { [categoryId]: { editing: bool, value: string, saving: bool } }
  const [catEditState, setCatEditState] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  const fetchCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
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

  const toggleCategoryExpand = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    categories.forEach((cat) => {
      allExpanded[cat.id] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // ---------------- Subcategory Price Editing ----------------
  const startEditingSubPrice = (sub) => {
    setSubEditState((prev) => ({
      ...prev,
      [sub.id]: {
        editing: true,
        value: sub.price_estimate || "",
        saving: false,
      },
    }));
  };

  const cancelEditingSubPrice = (subId) => {
    setSubEditState((prev) => {
      const updated = { ...prev };
      delete updated[subId];
      return updated;
    });
  };

  const saveSubcategoryPrice = async (catId, subId, subName) => {
    const edit = subEditState[subId];
    if (!edit || !edit.value.trim()) {
      showToast("Please enter a valid price estimate", "error");
      return;
    }

    const newPrice = edit.value.trim();

    setSubEditState((prev) => ({
      ...prev,
      [subId]: { ...prev[subId], saving: true },
    }));

    try {
      const res = await fetch(`${API_URL}/admin/subcategories/${subId}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_estimate: newPrice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update subcategory price");

      // Optimistically update categories state
      setCategories((prevCats) =>
        prevCats.map((cat) => {
          if (cat.id !== catId) return cat;
          const updatedSubs = (cat.subcategories || []).map((s) =>
            s.id === subId ? { ...s, price_estimate: newPrice } : s
          );
          return { ...cat, subcategories: updatedSubs };
        })
      );

      cancelEditingSubPrice(subId);
      showToast(`Updated price for "${subName}" to ${newPrice}!`, "success");
    } catch (err) {
      setSubEditState((prev) => ({
        ...prev,
        [subId]: { ...prev[subId], saving: false },
      }));
      showToast(err.message, "error");
    }
  };

  // ---------------- Category Base Price Editing ----------------
  const startEditingCatPrice = (cat) => {
    setCatEditState((prev) => ({
      ...prev,
      [cat.id]: {
        editing: true,
        value: cat.price_estimate || "",
        saving: false,
      },
    }));
  };

  const cancelEditingCatPrice = (catId) => {
    setCatEditState((prev) => {
      const updated = { ...prev };
      delete updated[catId];
      return updated;
    });
  };

  const saveCategoryPrice = async (catId, catName) => {
    const edit = catEditState[catId];
    if (!edit || !edit.value.trim()) {
      showToast("Please enter a valid base price", "error");
      return;
    }

    const newPrice = edit.value.trim();

    setCatEditState((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], saving: true },
    }));

    try {
      const res = await fetch(`${API_URL}/admin/categories/${catId}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_estimate: newPrice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category price");

      // Optimistically update category state
      setCategories((prevCats) =>
        prevCats.map((cat) =>
          cat.id === catId ? { ...cat, price_estimate: newPrice } : cat
        )
      );

      cancelEditingCatPrice(catId);
      showToast(`Base price for "${catName}" updated to ${newPrice}!`, "success");
    } catch (err) {
      setCatEditState((prev) => ({
        ...prev,
        [catId]: { ...prev[catId], saving: false },
      }));
      showToast(err.message, "error");
    }
  };

  // ---------------- Statistics & Search Filtering ----------------
  const totalPros = categories.reduce((s, c) => s + Number(c.total_professionals || 0), 0);
  const totalVerified = categories.reduce((s, c) => s + Number(c.verified_count || 0), 0);
  const totalSubcategories = categories.reduce((s, c) => s + (c.subcategories?.length || 0), 0);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.trim().toLowerCase();
    return categories.filter((cat) => {
      const catMatch = cat.name.toLowerCase().includes(query) || cat.description?.toLowerCase().includes(query);
      const subMatch = (cat.subcategories || []).some((sub) => sub.name.toLowerCase().includes(query));
      return catMatch || subMatch;
    });
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "350px",
          gap: "16px",
          color: "var(--text-muted)",
        }}
      >
        <RefreshCw size={36} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontWeight: 500 }}>Loading services and pricing matrix…</p>
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
        <XCircle size={44} style={{ margin: "0 auto 12px" }} />
        <p style={{ fontWeight: "600", fontSize: "16px" }}>Error: {error}</p>
        <button
          onClick={() => fetchCategories()}
          style={{
            marginTop: "16px",
            background: "var(--accent-primary)",
            color: "white",
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Tags size={28} style={{ color: "var(--accent-primary)" }} /> Services & Pricing Management
          </h1>
          <p className="page-subtitle">
            Configure, edit, and update live prices for all service categories and individual subcategories. Changes sync in real time with user bookings.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
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
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <RefreshCw
              size={16}
              style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Categories", value: categories.length, color: "#6366f1", icon: <Tags size={20} /> },
          { label: "Total Subcategories", value: totalSubcategories, color: "#0ea5e9", icon: <IndianRupee size={20} /> },
          { label: "Total Professionals", value: totalPros, color: "#f59e0b", icon: <Users size={20} /> },
          { label: "Verified Pros", value: totalVerified, color: "#10b981", icon: <UserCheck size={20} /> },
        ].map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{
              padding: "18px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-surface)",
              borderRadius: "14px",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `${s.color}15`,
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

      {/* Search & Actions Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: "1 1 300px",
            maxWidth: "500px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search service category or subcategory name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 42px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={expandAll}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
              padding: "9px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Expand All Subcategories
          </button>
          <button
            onClick={collapseAll}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
              padding: "9px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Categories & Pricing List */}
      {filteredCategories.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
            padding: "60px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <Tags size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", marginBottom: "6px" }}>
            No matching services found
          </h3>
          <p style={{ fontSize: "14px" }}>
            {searchQuery ? `No service or subcategory matched "${searchQuery}".` : "No categories found in the database."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredCategories.map((cat) => {
            const style = CATEGORY_STYLE[cat.name] || DEFAULT_STYLE;
            const subs = cat.subcategories || [];
            const isExpanded = expandedCategories[cat.id] ?? false;
            const catEdit = catEditState[cat.id];

            return (
              <div
                key={cat.id}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-light)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Category Header Row */}
                <div
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    borderBottom: isExpanded ? "1px solid var(--border-light)" : "none",
                    background: "var(--bg-surface)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 320px" }}>
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
                        boxShadow: `0 4px 12px ${style.from}33`,
                      }}
                    >
                      {style.icon}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                          {cat.name}
                        </h2>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "var(--bg-base)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          ID #{cat.id}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#10b981",
                            background: "rgba(16, 185, 129, 0.1)",
                            padding: "2px 10px",
                            borderRadius: "12px",
                          }}
                        >
                          {subs.length} subcategories
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          margin: "4px 0 0 0",
                          maxWidth: "600px",
                          lineHeight: 1.4,
                        }}
                      >
                        {cat.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Category Base Price & Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Category Base Price Box */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "var(--bg-base)",
                        padding: "8px 14px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                          Base Rate
                        </span>
                        {catEdit?.editing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            <input
                              type="text"
                              value={catEdit.value}
                              onChange={(e) =>
                                setCatEditState((prev) => ({
                                  ...prev,
                                  [cat.id]: { ...prev[cat.id], value: e.target.value },
                                }))
                              }
                              style={{
                                width: "120px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--accent-primary)",
                                fontSize: "13px",
                                fontWeight: 700,
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => saveCategoryPrice(cat.id, cat.name)}
                              disabled={catEdit.saving}
                              style={{
                                background: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                              title="Save Price"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => cancelEditingCatPrice(cat.id)}
                              disabled={catEdit.saving}
                              style={{
                                background: "var(--text-muted)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                              {cat.price_estimate || "Flexible"}
                            </span>
                            <button
                              onClick={() => startEditingCatPrice(cat)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--accent-primary)",
                                cursor: "pointer",
                                padding: "2px",
                                display: "flex",
                                alignItems: "center",
                              }}
                              title="Edit Category Base Price"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleCategoryExpand(cat.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: isExpanded ? "rgba(99, 102, 241, 0.1)" : "var(--bg-base)",
                        color: isExpanded ? "var(--accent-primary)" : "var(--text-secondary)",
                        border: "1px solid var(--border-light)",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {isExpanded ? (
                        <>
                          Hide Subcategories <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Manage Pricing ({subs.length}) <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Subcategories Accordion Panel */}
                {isExpanded && (
                  <div
                    style={{
                      background: "var(--bg-base)",
                      padding: "20px 24px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Subcategory Pricing Breakdown
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Click the edit icon or price tag to adjust rates for this sub-service
                      </span>
                    </div>

                    {subs.length === 0 ? (
                      <div
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          color: "var(--text-muted)",
                          background: "var(--bg-surface)",
                          borderRadius: "12px",
                          border: "1px dashed var(--border-light)",
                        }}
                      >
                        No subcategories registered for this category yet.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                          gap: "14px",
                        }}
                      >
                        {subs.map((sub) => {
                          const edit = subEditState[sub.id];

                          return (
                            <div
                              key={sub.id}
                              style={{
                                background: "var(--bg-surface)",
                                borderRadius: "12px",
                                border: edit?.editing ? "2px solid var(--accent-primary)" : "1px solid var(--border-light)",
                                padding: "14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                boxShadow: "var(--shadow-sm)",
                                transition: "border-color 0.2s ease",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {sub.image_url ? (
                                  <img
                                    src={sub.image_url}
                                    alt={sub.name}
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      flexShrink: 0,
                                      border: "1px solid var(--border-light)",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "8px",
                                      background: "var(--bg-base)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "var(--text-muted)",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Tags size={20} />
                                  </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: 700,
                                      color: "var(--text-primary)",
                                      marginBottom: "3px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={sub.name}
                                  >
                                    {sub.name}
                                  </h4>
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    Sub ID #{sub.id}
                                  </span>
                                </div>
                              </div>

                              {/* Price Edit Area */}
                              <div
                                style={{
                                  background: "var(--bg-base)",
                                  padding: "10px 12px",
                                  borderRadius: "8px",
                                  border: "1px solid var(--border-light)",
                                }}
                              >
                                {edit?.editing ? (
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                      <input
                                        type="text"
                                        value={edit.value}
                                        onChange={(e) =>
                                          setSubEditState((prev) => ({
                                            ...prev,
                                            [sub.id]: { ...prev[sub.id], value: e.target.value },
                                          }))
                                        }
                                        placeholder="e.g. From ₹299"
                                        style={{
                                          flex: 1,
                                          padding: "7px 10px",
                                          borderRadius: "6px",
                                          border: "1px solid var(--accent-primary)",
                                          fontSize: "13px",
                                          fontWeight: 600,
                                          color: "var(--text-primary)",
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => saveSubcategoryPrice(cat.id, sub.id, sub.name)}
                                        disabled={edit.saving}
                                        style={{
                                          background: "#10b981",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "6px",
                                          padding: "8px 12px",
                                          fontWeight: 600,
                                          fontSize: "13px",
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "4px",
                                        }}
                                      >
                                        <Check size={14} />
                                        {edit.saving ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        onClick={() => cancelEditingSubPrice(sub.id)}
                                        disabled={edit.saving}
                                        style={{
                                          background: "var(--text-muted)",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "6px",
                                          padding: "8px 10px",
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                        title="Cancel"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>

                                    {/* Quick Preset Buttons */}
                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                      {PRESET_PRICES.slice(0, 5).map((preset) => (
                                        <button
                                          key={preset}
                                          type="button"
                                          onClick={() =>
                                            setSubEditState((prev) => ({
                                              ...prev,
                                              [sub.id]: { ...prev[sub.id], value: preset },
                                            }))
                                          }
                                          style={{
                                            background: edit.value === preset ? "var(--accent-primary)" : "var(--bg-surface)",
                                            color: edit.value === preset ? "white" : "var(--text-secondary)",
                                            border: "1px solid var(--border-light)",
                                            borderRadius: "4px",
                                            padding: "2px 6px",
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                          }}
                                        >
                                          {preset}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                                        Current Rate
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "15px",
                                          fontWeight: 700,
                                          color: "var(--accent-primary)",
                                        }}
                                      >
                                        {sub.price_estimate || "Not Set"}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => startEditingSubPrice(sub)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: "var(--bg-surface)",
                                        border: "1px solid var(--border-light)",
                                        color: "var(--text-secondary)",
                                        borderRadius: "6px",
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--accent-primary)";
                                        e.currentTarget.style.color = "var(--accent-primary)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border-light)";
                                        e.currentTarget.style.color = "var(--text-secondary)";
                                      }}
                                    >
                                      <Edit3 size={13} /> Edit Price
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}