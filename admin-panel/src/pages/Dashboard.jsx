import { useEffect, useState } from "react";
import { API_URL, getDashboard } from "../services/api";
import { Users, UserCog, ShieldAlert, ClipboardList, CreditCard, CheckCircle } from 'lucide-react';

function Dashboard() {
  const [data, setData] = useState({
    users: 0,
    professionals: 0,
    pendingVerification: 0,
    serviceRequests: 0,
    awaitingPayments: 0,
    paidPayments: 0,
    confirmedPaymentValue: 0,
  });

  useEffect(() => {
    const fetchDashboard = () => getDashboard()
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error(error);
      });
    fetchDashboard();

    const stream = new EventSource(`${API_URL}/admin/notifications/stream`);
    const refresh = () => fetchDashboard();
    stream.addEventListener("service_request_updated", refresh);
    stream.addEventListener("payment_confirmed", refresh);
    return () => stream.close();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back, here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-header">
            <div>
              <div className="stat-title">Total Users</div>
              <div className="stat-value">{data.users}</div>
            </div>
            <div className="stat-icon">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div>
              <div className="stat-title">Professionals</div>
              <div className="stat-value">{data.professionals}</div>
            </div>
            <div className="stat-icon">
              <UserCog size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div>
              <div className="stat-title">Pending Verification</div>
              <div className="stat-value">{data.pendingVerification}</div>
            </div>
            <div className="stat-icon">
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div>
              <div className="stat-title">Service Requests</div>
              <div className="stat-value">{data.serviceRequests}</div>
            </div>
            <div className="stat-icon">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div>
              <div className="stat-title">Awaiting Payment</div>
              <div className="stat-value">{data.awaitingPayments}</div>
            </div>
            <div className="stat-icon"><CreditCard size={24} /></div>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-header">
            <div>
              <div className="stat-title">Paid Jobs</div>
              <div className="stat-value">{data.paidPayments}</div>
            </div>
            <div className="stat-icon"><CheckCircle size={24} /></div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div>
              <div className="stat-title">Confirmed Value</div>
              <div className="stat-value">₹{Number(data.confirmedPaymentValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-icon"><CreditCard size={24} /></div>
          </div>
        </div>
      </div>

      <div className="section-container">
        <h2>Recent Activity</h2>
        <p style={{ color: "var(--text-muted)" }}>Activity feed will be displayed here.</p>
      </div>
    </div>
  );
}

export default Dashboard;
