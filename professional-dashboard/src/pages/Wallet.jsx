import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle, Clock, Users, Gift, Copy, Check, AlertCircle } from 'lucide-react';

const API = import.meta.env.DEV
  ? 'https://service-marketplace-af7p.onrender.com'
  : 'https://service-marketplace-af7p.onrender.com';

const PERIODS = [
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year',  label: 'This Year' },
  { key: 'all',   label: 'All Time' },
];

function Wallet() {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [referrals, setReferrals] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [period, setPeriod] = useState('month');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  const token = localStorage.getItem('professionalToken');

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API}/api/professionals/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchEarnings = async (p) => {
    setLoadingEarnings(true);
    try {
      const res = await fetch(`${API}/api/professionals/earnings?period=${p}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setEarnings(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const fetchReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const res = await fetch(`${API}/api/professionals/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setReferrals(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEarnings('month');
    fetchReferrals();
  }, []);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    fetchEarnings(p);
  };

  const handleCopyCode = () => {
    if (!referrals?.referral_code) return;
    navigator.clipboard.writeText(referrals.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const completionRate = stats && stats.total_requests > 0
    ? Math.round((stats.completed_requests / stats.total_requests) * 100)
    : 0;

  if (loadingStats) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 16 }}>
      <RefreshCw className="spin" size={28} color="var(--accent-primary)" />
      <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Loading wallet...</span>
    </div>
  );

  return (
    <div className="pro-dashboard-root" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 16px' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>My Wallet</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Track your earnings and payment history.</p>
      </div>

      {/* ── TOTAL EARNINGS SPOTLIGHT CARD ── */}
      <div className="pro-earnings-card" style={{ margin: '0 24px 24px' }}>
        <div className="pro-earnings-left">
          <div className="pro-earnings-label">Total Earnings</div>
          <div className="pro-earnings-amount">₹{(stats?.total_earnings || 0).toLocaleString()}</div>
          <button className="pro-earnings-cta" onClick={() => alert('Withdraw functionality coming soon!')}>
            Withdraw <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="pro-earnings-right">
          <div className="pro-completion-ring">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--ring-track)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="var(--accent-primary)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="pro-ring-label">
              <span className="pro-ring-val">{completionRate}%</span>
              <span className="pro-ring-sub">Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROVIDER REFERRAL & 2% COMMISSION CARD ── */}
      <div className="section-container" style={{ margin: '0 24px 24px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', border: '1px solid #c7d2fe', borderRadius: 16, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gift size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#1e1b4b' }}>
                Refer Providers & Earn 2% Commission
              </h2>
              <p style={{ fontSize: 12, color: '#6366f1', margin: '2px 0 0', fontWeight: 600 }}>
                Earn 2% of every job completed by providers you refer
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code Share Row */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, border: '1px dashed #818cf8' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Your Referral Code</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4338ca', letterSpacing: '0.05em', marginTop: 2 }}>
              {referrals?.referral_code || 'PRO-XXXXXX'}
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: copiedCode ? '#16a34a' : '#4f46e5',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {copiedCode ? <Check size={14} /> : <Copy size={14} />}
            {copiedCode ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* 15 Works Completed Eligibility Meter */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '14px 16px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
              Monthly Eligibility Target (15 Works Required)
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 12,
              background: referrals?.eligibility?.is_eligible ? '#dcfce7' : '#fef3c7',
              color: referrals?.eligibility?.is_eligible ? '#15803d' : '#b45309'
            }}>
              {referrals?.eligibility?.is_eligible ? '✓ Eligible for 2% Commission' : 'In Progress'}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              width: `${Math.min(100, Math.round(((referrals?.eligibility?.monthly_completed_jobs || 0) / 15) * 100))}%`,
              height: '100%',
              background: referrals?.eligibility?.is_eligible ? '#16a34a' : '#f59e0b',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <span>
              <strong>{referrals?.eligibility?.monthly_completed_jobs || 0}</strong> of 15 completed this month
            </span>
            {referrals?.eligibility?.is_eligible ? (
              <span style={{ color: '#15803d', fontWeight: 700 }}>2% Commission unlocked!</span>
            ) : (
              <span style={{ color: '#d97706', fontWeight: 600 }}>
                Complete {referrals?.eligibility?.jobs_remaining || 15} more jobs to unlock
              </span>
            )}
          </div>
        </div>

        {/* Referral Earnings Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 10, padding: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Providers Referred</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginTop: 4 }}>
              {referrals?.stats?.total_referred || 0}
            </div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: 10, padding: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>Eligible Earned</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              ₹{(referrals?.stats?.total_earned_commission || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: 10, padding: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>Pending 15 Jobs</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309', marginTop: 4 }}>
              ₹{(referrals?.stats?.total_pending_commission || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Referred Providers Mini List */}
        {referrals?.referred_providers?.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              Referred Providers ({referrals.referred_providers.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {referrals.referred_providers.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{p.full_name}</span>
                    <span style={{ color: '#64748b', marginLeft: 6 }}>({p.category || 'Provider'})</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#64748b' }}>{p.completed_jobs} jobs</span>
                    <strong style={{ color: '#4f46e5', marginLeft: 8 }}>+₹{Number(p.total_commission_generated || 0).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── EARNINGS BREAKDOWN WITH FILTER ── */}
      <div className="section-container" style={{ margin: '0 24px 20px' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '6px', marginBottom: 16, paddingBottom: 2 }}>
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePeriodChange(key)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '16px',
                border: 'none',
                background: period === key ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
                color: period === key ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '11.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: period === key ? '0 4px 12px rgba(71,85,105,0.2)' : 'none'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mini stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Earned</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d' }}>
              {loadingEarnings ? '...' : `₹${(earnings?.period_earnings || 0).toLocaleString()}`}
            </div>
            <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>
              {earnings?.paid_jobs || 0} job{earnings?.paid_jobs !== 1 ? 's' : ''} paid
            </div>
          </div>
          <div style={{ background: '#fffbeb', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#b45309' }}>
              {loadingEarnings ? '...' : `₹${(earnings?.pending_earnings || 0).toLocaleString()}`}
            </div>
            <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 2 }}>
              {earnings?.pending_jobs || 0} awaiting payment
            </div>
          </div>
        </div>

        {/* Job-by-job list */}
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>Transactions</h2>
        {loadingEarnings ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <RefreshCw className="spin" size={22} color="var(--accent-primary)" />
          </div>
        ) : !earnings?.jobs?.length ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 14 }}>
            No transactions found for this period.
          </div>
        ) : (
          earnings.jobs.map((job, idx) => (
            <div
              key={job.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: idx !== earnings.jobs.length - 1 ? '1px solid var(--border-light)' : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: job.payment_status === 'paid' ? '#dcfce7' : '#fef9c3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {job.payment_status === 'paid'
                    ? <CheckCircle size={18} color="#16a34a" />
                    : <Clock size={18} color="#d97706" />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {job.customer_name} · {new Date(job.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  color: job.payment_status === 'paid' ? '#16a34a' : '#d97706'
                }}>
                  {job.payment_status === 'paid' ? '+' : ''}₹{Number(job.wage || 0).toLocaleString()}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: job.payment_status === 'paid' ? '#16a34a' : '#d97706'
                }}>
                  {job.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Wallet;
