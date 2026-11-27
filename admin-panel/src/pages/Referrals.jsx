import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Search, 
  ArrowUpRight, 
  Award,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { getAdminReferrals } from '../services/api';

export default function Referrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState('referrers'); // 'referrers', 'commissions', 'referred'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReferrals = async (month) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminReferrals(month);
      setData(res);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals(selectedMonth);
  }, [selectedMonth]);

  const summary = data?.summary || {};
  const referrers = (data?.referrers || []).filter(r => 
    !searchQuery || 
    r.referrer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referral_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referrer_category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const commissions = (data?.commissions || []).filter(c =>
    !searchQuery ||
    c.referrer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.referred_pro_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.service_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const referredList = (data?.referred_providers || []).filter(p =>
    !searchQuery ||
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.referrer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Provider Referrals & 2% Commissions
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Track provider-to-provider referrals, 2% commissions, and monthly 15-work eligibility.
          </p>
        </div>

        {/* Month Selector & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
            />
          </div>
          <button 
            onClick={() => fetchReferrals(selectedMonth)} 
            className="action-btn"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Referrers</span>
            <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px', color: '#4338ca' }}><Users size={18} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {summary.active_referrers || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Providers who referred others
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Referred Providers</span>
            <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '8px', color: '#059669' }}><Award size={18} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#059669' }}>
            {summary.total_referred_providers || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Joined using provider code
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Eligible 2% Commission</span>
            <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '8px', color: '#2563eb' }}><CheckCircle size={18} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#2563eb' }}>
            ₹{Number(summary.total_eligible_commissions || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
            Earned by pros with ≥15 works
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Eligibility</span>
            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px', color: '#d97706' }}><Clock size={18} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#d97706' }}>
            ₹{Number(summary.total_pending_commissions || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Requires 15 monthly jobs
          </div>
        </div>
      </div>

      {/* Rules Banner */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Gift size={18} />
        </div>
        <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
          <strong>Referral Rule:</strong> Provider A earns a <strong>2% commission</strong> on every completed work by referred providers. 
          The referrer is <strong>only eligible</strong> to receive the commission if they complete <strong>at least 15 works</strong> in that calendar month.
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('referrers')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                background: activeTab === 'referrers' ? 'var(--accent-primary, #4f46e5)' : 'var(--bg-surface-hover, #f1f5f9)',
                color: activeTab === 'referrers' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              Referrer Providers ({referrers.length})
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                background: activeTab === 'commissions' ? 'var(--accent-primary, #4f46e5)' : 'var(--bg-surface-hover, #f1f5f9)',
                color: activeTab === 'commissions' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              2% Commission Transactions ({commissions.length})
            </button>
            <button
              onClick={() => setActiveTab('referred')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                background: activeTab === 'referred' ? 'var(--accent-primary, #4f46e5)' : 'var(--bg-surface-hover, #f1f5f9)',
                color: activeTab === 'referred' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              All Referred Providers ({referredList.length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-hover, #f8fafc)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search provider, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Tab 1: Referrers Table */}
        {activeTab === 'referrers' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Provider Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Referral Code</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Providers Referred</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Monthly Works ({selectedMonth})</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>15-Work Eligibility</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Month 2% Commission</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>All-Time Commission</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                      <RefreshCw className="spin" size={24} style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : referrers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No referrers found.
                    </td>
                  </tr>
                ) : (
                  referrers.map((ref) => (
                    <tr key={ref.referrer_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ref.referrer_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ref.referrer_phone || ref.referrer_email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '12px' }}>
                          {ref.referral_code}
                        </code>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{ref.referrer_category || 'N/A'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#4f46e5' }}>
                          {ref.total_referred_count}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: ref.is_eligible_this_month ? '#16a34a' : '#d97706' }}>
                            {ref.monthly_completed_jobs}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 15</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {ref.is_eligible_this_month ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                            <CheckCircle size={12} /> Eligible (≥15)
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                            <Clock size={12} /> Need {ref.jobs_needed_for_eligibility} more
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: ref.is_eligible_this_month ? '#15803d' : '#b45309' }}>
                          ₹{Number(ref.month_eligible_commission || 0).toFixed(2)}
                        </div>
                        {!ref.is_eligible_this_month && Number(ref.month_pending_commission || 0) > 0 && (
                          <div style={{ fontSize: '11px', color: '#b45309' }}>
                            (₹{Number(ref.month_pending_commission).toFixed(2)} locked)
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#2563eb' }}>
                        ₹{Number(ref.all_time_commission || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: 2% Commission Transactions */}
        {activeTab === 'commissions' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Date & Month</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Beneficiary (Referrer)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Worker (Referred Pro)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Service Title</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Service Wage</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Commission Rate</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>2% Commission</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Eligibility Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                      <RefreshCw className="spin" size={24} style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No commission transactions yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((comm) => (
                    <tr key={comm.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{new Date(comm.created_at).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{comm.month_year}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {comm.referrer_name}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        {comm.referred_pro_name}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        {comm.service_title || 'Service Request #' + comm.request_id}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        ₹{Number(comm.service_wage || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#4f46e5' }}>
                        {comm.commission_rate}%
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#16a34a' }}>
                        +₹{Number(comm.commission_amount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {comm.status === 'eligible' || comm.status === 'paid' ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                            ✓ Eligible
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                            Pending (Need 15 Works)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: All Referred Providers */}
        {activeTab === 'referred' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Provider Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Referred By</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Referral Code Used</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Completed Works</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>2% Commission Generated</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700 }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                      <RefreshCw className="spin" size={24} style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : referredList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No referred providers found.
                    </td>
                  </tr>
                ) : (
                  referredList.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.phone || p.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{p.category || 'N/A'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: p.verification_status === 'verified' ? '#dcfce7' : '#f1f5f9',
                          color: p.verification_status === 'verified' ? '#15803d' : '#64748b'
                        }}>
                          {p.verification_status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.referrer_name}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '12px' }}>
                          {p.used_referral_code}
                        </code>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {p.completed_jobs}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#16a34a' }}>
                        ₹{Number(p.total_commission_generated || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(p.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
