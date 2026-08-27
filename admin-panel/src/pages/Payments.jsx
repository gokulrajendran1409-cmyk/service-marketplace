import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react";
import { API_URL } from "../services/api";

const PAYMENT_STATUS = {
	unpaid: { label: "Not submitted", color: "#64748b", background: "#f1f5f9", icon: <Clock size={14} /> },
	awaiting_payment: { label: "Awaiting confirmation", color: "#b45309", background: "#fef3c7", icon: <Clock size={14} /> },
	paid: { label: "Paid", color: "#15803d", background: "#dcfce7", icon: <CheckCircle size={14} /> },
};

function PaymentBadge({ status }) {
	const config = PAYMENT_STATUS[status] || PAYMENT_STATUS.unpaid;
	return (
		<span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, color: config.color, background: config.background, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
			{config.icon} {config.label}
		</span>
	);
}

function formatAmount(amount) {
	if (amount == null) return "—";
	return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Payments() {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");

	const fetchPayments = async (silent = false) => {
		if (silent) setRefreshing(true);
		else setLoading(true);
		setError("");
		try {
			const response = await fetch(`${API_URL}/admin/service-requests`);
			if (!response.ok) throw new Error("Failed to fetch payment details");
			setRequests(await response.json());
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchPayments();
		const stream = new EventSource(`${API_URL}/admin/notifications/stream`);
		const refresh = () => fetchPayments(true);
		stream.addEventListener("service_request_updated", refresh);
		stream.addEventListener("payment_confirmed", refresh);
		return () => stream.close();
	}, []);

	const payments = useMemo(() => requests.filter((request) => request.payment_status !== "unpaid" || request.wage != null), [requests]);
	const totals = useMemo(() => ({
		submitted: payments.filter((payment) => payment.wage != null).length,
		awaiting: payments.filter((payment) => payment.payment_status === "awaiting_payment").length,
		paid: payments.filter((payment) => payment.payment_status === "paid").length,
		value: payments.filter((payment) => payment.payment_status === "paid").reduce((sum, payment) => sum + Number(payment.wage || 0), 0),
	}), [payments]);

	if (loading) return <div className="section-container" style={{ textAlign: "center", padding: 60 }}><RefreshCw size={28} style={{ animation: "spin 1s linear infinite" }} /><p style={{ color: "var(--text-muted)" }}>Loading payment details...</p></div>;
	if (error) return <div className="section-container" style={{ textAlign: "center", padding: 40, color: "var(--error)" }}><XCircle size={36} /><p>{error}</p><button onClick={() => fetchPayments()} style={{ padding: "8px 16px", cursor: "pointer" }}>Retry</button></div>;

	return (
		<div>
			<div className="page-header"><h1 className="page-title">Payments</h1><p className="page-subtitle">Track wages submitted by professionals and customer confirmations.</p></div>
			<div className="stats-grid">
				<div className="stat-card blue"><div className="stat-title">Wages submitted</div><div className="stat-value">{totals.submitted}</div></div>
				<div className="stat-card orange"><div className="stat-title">Awaiting confirmation</div><div className="stat-value">{totals.awaiting}</div></div>
				<div className="stat-card green"><div className="stat-title">Paid jobs</div><div className="stat-value">{totals.paid}</div></div>
				<div className="stat-card purple"><div className="stat-title">Confirmed value</div><div className="stat-value">{formatAmount(totals.value)}</div></div>
			</div>
			<div className="section-container" style={{ padding: 0, overflowX: "auto" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--border-light)" }}>
					<h2 style={{ margin: 0 }}>Payment activity</h2>
					<button onClick={() => fetchPayments(true)} disabled={refreshing} title="Refresh payments" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", cursor: "pointer" }}><RefreshCw size={14} className={refreshing ? "spin" : ""} /> Refresh</button>
				</div>
				{payments.length === 0 ? <p style={{ padding: 24, color: "var(--text-muted)" }}>No wages have been submitted yet.</p> : (
					<table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
						<thead><tr>{["Request", "Customer", "Professional", "Wage", "Description", "Status", "Updated"].map((heading) => <th key={heading} style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>{heading}</th>)}</tr></thead>
						<tbody>{payments.map((payment) => <tr key={payment.id} style={{ borderTop: "1px solid var(--border-light)" }}>
							<td style={{ padding: "14px 16px", fontWeight: 600 }}>{payment.title}<div style={{ color: "var(--text-muted)", fontSize: 12 }}>#{payment.id}</div></td>
							<td style={{ padding: "14px 16px" }}>{payment.user_name || "—"}</td>
							<td style={{ padding: "14px 16px" }}>{payment.professional_name || "—"}</td>
							<td style={{ padding: "14px 16px", fontWeight: 700 }}>{formatAmount(payment.wage)}</td>
							<td style={{ padding: "14px 16px", color: "var(--text-secondary)", maxWidth: 220 }}>{payment.wage_description || "—"}</td>
							<td style={{ padding: "14px 16px" }}><PaymentBadge status={payment.payment_status} /></td>
							<td style={{ padding: "14px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{payment.updated_at ? new Date(payment.updated_at).toLocaleString("en-IN") : "—"}</td>
						</tr>)}</tbody>
					</table>
				)}
			</div>
		</div>
	);
}