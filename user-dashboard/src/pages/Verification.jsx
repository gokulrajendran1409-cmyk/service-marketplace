import { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Smartphone, Loader2, ArrowRight } from 'lucide-react';
import { useToast, Toast } from '../components/Toast';
import { AUTH_API as API } from '../constants';

export default function Verification({ user, token, onVerified, onLogout }) {
  const { toast, showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email State
  const [emailOtp, setEmailOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);

  // Phone State
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneChannel, setPhoneChannel] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    let emailInterval;
    if (emailTimer > 0) {
      emailInterval = setInterval(() => setEmailTimer(p => p - 1), 1000);
    }
    return () => clearInterval(emailInterval);
  }, [emailTimer]);

  useEffect(() => {
    let phoneInterval;
    if (phoneTimer > 0) {
      phoneInterval = setInterval(() => setPhoneTimer(p => p - 1), 1000);
    }
    return () => clearInterval(phoneInterval);
  }, [phoneTimer]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/verification-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.verification);
        if (data.verification.accountVerified) {
          onVerified();
        }
      }
    } catch (err) {
      showToast('Failed to load verification status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOtp = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch(`${API}/email/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setEmailSent(true);
      setEmailTimer(data.resendAfter || 60);
      showToast('Verification code sent to your email', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch(`${API}/email/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email, otp: emailOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showToast('Email verified successfully', 'success');
      fetchStatus();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const sendPhoneOtp = async () => {
    setPhoneLoading(true);
    try {
      const res = await fetch(`${API}/phone/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: user.phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setPhoneSent(true);
      setPhoneTimer(data.resendAfter || 60);
      setPhoneChannel(data.channel); // 'whatsapp' or 'sms'
      
      if (data.channel === 'whatsapp') {
        showToast('Verification code sent to WhatsApp', 'success');
      } else {
        showToast('WhatsApp unavailable. OTP sent by SMS.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    setPhoneLoading(true);
    try {
      const res = await fetch(`${API}/phone/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: user.phone, otp: phoneOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showToast('Phone verified successfully', 'success');
      fetchStatus();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  if (loading || !status) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Loader2 className="spin" size={32} color="#00796B" />
        <p style={{ marginTop: 16 }}>Checking verification status...</p>
      </div>
    );
  }

  const needsEmail = !status.email.verified;
  const needsPhone = !status.phone.verified;

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: 56, height: 56, background: '#E0F2F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldCheck size={28} color="#00796B" />
        </div>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Verify your account</h2>
        <p style={{ margin: '8px 0 0', color: '#6B7280', fontSize: '15px' }}>
          To keep our marketplace safe, we need to verify your contact details.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Email Verification Block */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={20} color={status.email.verified ? '#10B981' : '#6B7280'} />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Email Verification</strong>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{user.email}</span>
              </div>
            </div>
            {status.email.verified ? (
              <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>✓ Verified</span>
            ) : (
              <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 600 }}>⚠ Not verified</span>
            )}
          </div>

          {!status.email.verified && (
            <div style={{ marginTop: '16px' }}>
              {!emailSent ? (
                <button 
                  onClick={sendEmailOtp} 
                  disabled={emailLoading}
                  style={{ width: '100%', padding: '10px', background: '#00796B', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {emailLoading ? <Loader2 size={16} className="spin" /> : 'Send Email OTP'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={emailOtp} 
                    onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '16px', letterSpacing: '2px', textAlign: 'center' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={verifyEmailOtp} 
                      disabled={emailLoading || emailOtp.length !== 6}
                      style={{ flex: 1, padding: '10px', background: '#00796B', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: emailOtp.length !== 6 ? 0.7 : 1 }}
                    >
                      Verify
                    </button>
                    <button 
                      onClick={sendEmailOtp} 
                      disabled={emailTimer > 0 || emailLoading}
                      style={{ padding: '10px 16px', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: emailTimer > 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {emailTimer > 0 ? `Resend in ${emailTimer}s` : 'Resend'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phone Verification Block */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Smartphone size={20} color={status.phone.verified ? '#10B981' : '#6B7280'} />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Phone Verification</strong>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{user.phone}</span>
              </div>
            </div>
            {status.phone.verified ? (
              <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>✓ Verified</span>
            ) : (
              <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 600 }}>⚠ Not verified</span>
            )}
          </div>

          {!status.phone.verified && (
            <div style={{ marginTop: '16px' }}>
              {!phoneSent ? (
                <button 
                  onClick={sendPhoneOtp} 
                  disabled={phoneLoading}
                  style={{ width: '100%', padding: '10px', background: '#00796B', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {phoneLoading ? <Loader2 size={16} className="spin" /> : 'Send Phone OTP'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <div style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '4px' }}>
                    {phoneChannel === 'whatsapp' ? 'OTP sent via WhatsApp' : 'WhatsApp unavailable. OTP sent via SMS'}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={phoneOtp} 
                    onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '16px', letterSpacing: '2px', textAlign: 'center' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={verifyPhoneOtp} 
                      disabled={phoneLoading || phoneOtp.length !== 6}
                      style={{ flex: 1, padding: '10px', background: '#00796B', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: phoneOtp.length !== 6 ? 0.7 : 1 }}
                    >
                      Verify
                    </button>
                    <button 
                      onClick={sendPhoneOtp} 
                      disabled={phoneTimer > 0 || phoneLoading}
                      style={{ padding: '10px 16px', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: phoneTimer > 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {phoneTimer > 0 ? `Resend in ${phoneTimer}s` : 'Resend'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 600, cursor: 'pointer' }}
        >
          Logout and try later
        </button>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
