import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  Star, 
  Wrench,
  Award
} from 'lucide-react';

export default function ServiceAcceptedModal({ notification, onTrack, onDismiss }) {
  if (!notification) return null;

  const metadata = notification.metadata || {};
  const requestId = notification.request_id || metadata.requestId;
  const professionalName = metadata.professionalName || 'Specialist';
  const professionalPhone = metadata.professionalPhone;
  const professionalCategory = metadata.professionalCategory || 'Service Professional';
  const professionalCity = metadata.professionalCity || 'Kerala';
  const experienceYears = metadata.experienceYears || 5;
  const rating = Number(metadata.rating) || 4.9;
  const reviewCount = Number(metadata.reviewCount) || 12;
  const serviceTitle = metadata.serviceTitle || notification.title || 'Selected Service';
  const requestedAt = metadata.requestedAt;
  const location = metadata.location;

  // Format date and time if available
  const formattedSchedule = requestedAt ? (() => {
    try {
      const d = new Date(requestedAt);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return requestedAt;
    }
  })() : null;

  // Elegant web-audio synthesis chime
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        
        // Tone 1 (E5 - 659.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Tone 2 (A5 - 880.00 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, now + 0.12);
        gain2.gain.setValueAtTime(0.15, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.55);
      }
    } catch {
      // Audio autoplay policy or unavailable - ignore safely
    }
  }, []);

  return (
    <div className="accepted-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onDismiss(notification)}>
      {/* Decorative celebration particles */}
      <div className="accepted-confetti-wrap" aria-hidden="true">
        <span className="confetti c1">✦</span>
        <span className="confetti c2">★</span>
        <span className="confetti c3">◆</span>
        <span className="confetti c4">✦</span>
        <span className="confetti c5">★</span>
        <span className="confetti c6">●</span>
      </div>

      <div className="accepted-card fade-scale-up" role="dialog" aria-modal="true" aria-labelledby="accepted-modal-title">
        {/* Top Dismiss Icon */}
        <button 
          className="accepted-close-btn" 
          onClick={() => onDismiss(notification)} 
          aria-label="Close notification"
          title="Dismiss"
        >
          <X size={18} />
        </button>

        {/* Celebration Badge Header */}
        <div className="accepted-header-badge-wrap">
          <div className="accepted-pulse-halo"></div>
          <div className="accepted-icon-badge">
            <CheckCircle2 size={36} className="accepted-check-icon" />
            <Sparkles size={18} className="accepted-sparkle-icon" />
          </div>
        </div>

        <div className="accepted-title-group">
          <div className="accepted-status-pill">
            <span className="pulse-dot"></span>
            <span>PROVIDER ACCEPTED & CONFIRMED</span>
          </div>
          <h2 id="accepted-modal-title" className="accepted-main-title">
            Service Request Accepted!
          </h2>
          <p className="accepted-subtitle">
            A verified professional has accepted your booking and is preparing for your service.
          </p>
        </div>

        {/* Professional Details Showcase Card */}
        <div className="accepted-pro-showcase">
          <div className="accepted-pro-avatar-wrap">
            <div className="accepted-pro-avatar">
              {professionalName.charAt(0).toUpperCase()}
            </div>
            <div className="accepted-pro-verified-badge" title="Verified Professional">
              <ShieldCheck size={14} />
            </div>
          </div>

          <div className="accepted-pro-info">
            <div className="accepted-pro-name-row">
              <h3 className="accepted-pro-name">{professionalName}</h3>
              <span className="accepted-category-pill">
                <Wrench size={11} />
                {professionalCategory}
              </span>
            </div>

            <div className="accepted-pro-meta-row">
              <div className="accepted-rating-tag">
                <Star size={13} className="star-filled" />
                <span className="rating-score">{rating}</span>
                <span className="rating-count">({reviewCount}+ reviews)</span>
              </div>
              <div className="accepted-exp-tag">
                <Award size={13} />
                <span>{experienceYears}+ yrs exp</span>
              </div>
              {professionalCity && (
                <div className="accepted-city-tag">
                  <MapPin size={12} />
                  <span>{professionalCity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Booking Snapshot */}
        <div className="accepted-booking-box">
          <div className="accepted-booking-header">
            <span className="accepted-booking-label">BOOKED SERVICE</span>
            {requestId && <span className="accepted-booking-id">#SR-{requestId}</span>}
          </div>
          <h4 className="accepted-service-title">{serviceTitle}</h4>
          
          <div className="accepted-booking-details-grid">
            {formattedSchedule && (
              <div className="accepted-detail-item">
                <Clock size={14} className="detail-icon" />
                <span>{formattedSchedule}</span>
              </div>
            )}
            {location && (
              <div className="accepted-detail-item" title={location}>
                <MapPin size={14} className="detail-icon" />
                <span className="detail-truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="accepted-actions-bar">
          <button 
            type="button" 
            className="btn-track-accepted"
            onClick={() => onTrack(notification)}
          >
            <span>Track Live in My Bookings</span>
            <ArrowRight size={18} />
          </button>

          {professionalPhone && (
            <a 
              href={`tel:${professionalPhone}`} 
              className="btn-call-accepted"
              title={`Call ${professionalName}`}
            >
              <PhoneCall size={16} />
              <span>Call Specialist</span>
            </a>
          )}
        </div>

        <button 
          type="button" 
          className="btn-accepted-dismiss" 
          onClick={() => onDismiss(notification)}
        >
          Dismiss & View Later
        </button>
      </div>
    </div>
  );
}
