import { useEffect, useMemo, useState } from "react";
import { CheckCircle, RefreshCw, Star, XCircle } from "lucide-react";
import { API_URL } from "../services/api";

function Stars({ rating }) {
	return <span style={{ color: "#f59e0b", letterSpacing: 1 }}>{"★".repeat(Number(rating))}{"☆".repeat(5 - Number(rating))}</span>;
}

export default function Reviews() {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchReviews = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_URL}/admin/reviews`);
			if (!response.ok) throw new Error("Failed to fetch reviews");
			setReviews(await response.json());
			setError("");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReviews();
		const stream = new EventSource(`${API_URL}/admin/notifications/stream`);
		const refresh = () => fetchReviews();
		stream.addEventListener("review_submitted", refresh);
		return () => stream.close();
	}, []);

	const averageRating = useMemo(() => reviews.length
		? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1)
		: "0.0", [reviews]);

	if (loading) return <div className="section-container" style={{ textAlign: "center", padding: 60 }}><RefreshCw size={28} className="spin" /><p style={{ color: "var(--text-muted)" }}>Loading reviews...</p></div>;
	if (error) return <div className="section-container" style={{ textAlign: "center", padding: 40, color: "var(--error)" }}><XCircle size={36} /><p>{error}</p><button onClick={fetchReviews}>Retry</button></div>;

	return (
		<div>
			<div className="page-header"><h1 className="page-title">Reviews</h1><p className="page-subtitle">Customer feedback and professional ratings.</p></div>
			<div className="stats-grid">
				<div className="stat-card blue"><div className="stat-title">Total Reviews</div><div className="stat-value">{reviews.length}</div></div>
				<div className="stat-card orange"><div className="stat-title">Average Rating</div><div className="stat-value">{averageRating} <Star size={22} style={{ verticalAlign: 2, color: "#f59e0b" }} /></div></div>
			</div>
			<div className="section-container" style={{ padding: 0, overflowX: "auto" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--border-light)" }}><h2 style={{ margin: 0 }}>Customer feedback</h2><button onClick={fetchReviews} title="Refresh reviews" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", cursor: "pointer" }}><RefreshCw size={14} /> Refresh</button></div>
				{reviews.length === 0 ? <p style={{ padding: 24, color: "var(--text-muted)" }}>No reviews have been submitted yet.</p> : <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}><thead><tr>{["Rating", "Professional", "Customer", "Request", "Comment", "Submitted"].map(heading => <th key={heading} style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>{heading}</th>)}</tr></thead><tbody>{reviews.map(review => <tr key={review.id} style={{ borderTop: "1px solid var(--border-light)" }}><td style={{ padding: "14px 16px" }}><Stars rating={review.rating} /><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{review.rating}/5</div></td><td style={{ padding: "14px 16px", fontWeight: 600 }}>{review.professional_name}</td><td style={{ padding: "14px 16px" }}>{review.customer_name}</td><td style={{ padding: "14px 16px" }}>{review.request_title}<div style={{ fontSize: 12, color: "var(--text-muted)" }}>#{review.request_id}</div></td><td style={{ padding: "14px 16px", color: "var(--text-secondary)", maxWidth: 260 }}>{review.comment || "—"}</td><td style={{ padding: "14px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(review.created_at).toLocaleString("en-IN")}</td></tr>)}</tbody></table>}
			</div>
		</div>
	);
}