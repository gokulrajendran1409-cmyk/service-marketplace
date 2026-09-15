import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Award,
  Star,
  Receipt,
  ArrowRight,
  X,
  FileText,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export default function ServiceCompletedModal({ notification, onViewDetails, onDismiss }) {
  if (!notification) return null;

  const metadata = notification.metadata || {};
  const requestId = notification.request_id || metadata.requestId;
  const professionalName = metadata.professionalName || 'Specialist';
  const professionalCategory = metadata.professionalCategory || 'Service Professional';
  const serviceTitle = metadata.serviceTitle || notification.title || 'Service Booking';

  // Completion audio fanfare
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        const playTone = (freq, start, dur) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.14, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + dur);
        };

        // Major chord arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
        playTone(523.25, now, 0.25);
        playTone(659.25, now + 0.12, 0.25);
        playTone(783.99, now + 0.24, 0.28);
        playTone(1046.5, now + 0.38, 0.55);
      }
    } catch {
      // Ignore if autoplay policy restricts
    }
  }, []);

  return (
    <div
      className="accepted-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onDismiss(notification)}
    >
      <div className="accepted-confetti-wrap" aria-hidden="true">
        <span className="confetti c1">🎉</span>
        <span className="confetti c2">★</span>
        <span className="confetti c3">✦</span>
        <span className="confetti c4">✨</span>
        <span className="confetti c5">★</span>
        <span className="confetti c6">●</span>
      </div>

      <div
        className="accepted-card fade-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completed-modal-title"
        style={{ maxWidth: 440 }}
      >
        <button
          className="accepted-close-btn"
          onClick={() => onDismiss(notification)}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>

        {/* Top Celebration Badge */}
        <div className="accepted-header-badge-wrap">
          <div className="accepted-pulse-halo" style={{ borderColor: 'rgba(16, 185, 129, 0.25)' }}></div>
          <div className="accepted-icon-badge" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <Award size={36} className="accepted-check-icon" />
            <Sparkles size={18} className="accepted-sparkle-icon" />
          </div>
        </div>

        <div className="accepted-title-group">
          <div
            className="accepted-status-pill"
            style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}
          >
            <span className="pulse-dot" style={{ background: '#10B981' }}></span>
            TASK COMPLETED
          </div>
          <h2 id="completed-modal-title" className="accepted-main-heading">
            Service Completed!
          </h2>
          <p className="accepted-sub-heading">
            {professionalName} has marked your service as successfully finished.
          </p>
        </div>

        {/* Service summary card */}
        <div
          className="visily-card"
          style={{
            padding: '14px 16px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            marginBottom: 16,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: '#00796B',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {professionalName.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14.5, color: '#0F172A', display: 'block' }}>
                {serviceTitle}
              </strong>
              <small style={{ fontSize: 12, color: '#64748B' }}>
                Completed by {professionalName} • {professionalCategory}
              </small>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid #E2E8F0',
              fontSize: 12.5,
              color: '#059669',
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={14} /> Service Verified
            </span>
            <span style={{ color: '#0F172A', fontWeight: 700 }}>
              Invoice Ready
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="visily-pill-btn"
            onClick={() => onViewDetails(notification)}
            style={{ background: 'linear-gradient(135deg, #00796B 0%, #004D40 100%)' }}
          >
            <Receipt size={17} /> View Invoice & Details <ArrowRight size={17} />
          </button>
          <button
            className="visily-pill-btn-outline"
            onClick={() => onDismiss(notification)}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
