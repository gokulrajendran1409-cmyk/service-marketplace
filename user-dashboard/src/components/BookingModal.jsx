import { useState } from 'react';
import { X, MapPin, FileText, Loader2 } from 'lucide-react';
import { API } from '../constants';

export function BookingModal({ professional, category, currentLocation, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: currentLocation
      ? currentLocation.placeName || `Current location (${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)})`
      : ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          professional_id: professional?.id,
          latitude: currentLocation?.latitude,
          longitude: currentLocation?.longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit');
      onSuccess(data.request);
    } catch (error) {
      alert(error.message || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h2 className="modal-title">Book a Service</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
        {professional && (
          <p className="modal-sub">Sending request to <strong>{professional.full_name}</strong> · {professional.category}</p>
        )}
        {!professional && category && (
          <p className="modal-sub">Requesting a <strong>{category}</strong> professional</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title"><FileText size={13} style={{ display: 'inline', marginRight: 4 }} />Service Title</label>
            <input
              id="title"
              className="form-input"
              name="title"
              placeholder="e.g. Fix leaking bathroom pipe"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              className="form-input"
              name="description"
              placeholder="Describe the problem or task in detail..."
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location"><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />Your Location / Address</label>
            <input
              id="location"
              className="form-input"
              name="location"
              placeholder="e.g. 42 Park Street, Chennai"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" style={{ display: 'inline' }} /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
