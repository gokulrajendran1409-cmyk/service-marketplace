import { useRef, useState } from 'react';
import { X, MapPin, FileText, Loader2, ImagePlus, Video, Mic, Square } from 'lucide-react';
import { API } from '../constants';

export function BookingModal({ professional, category, currentLocation, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requested_at: '',
    location: currentLocation
      ? currentLocation.placeName || `Current location (${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)})`
      : ''
  });
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [voice, setVoice] = useState(null);
  const [recording, setRecording] = useState(false);
  const [distanceConfirmed, setDistanceConfirmed] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'requested_at') setScheduleError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.requested_at) {
      if (!form.requested_at) setScheduleError('Please choose when you expect the professional.');
      return;
    }
    if (new Date(form.requested_at).getTime() <= Date.now()) {
      setScheduleError('This date and time has already passed. Please choose a future time.');
      return;
    }
    if (professional?.distance_from_user > 15 && !distanceConfirmed) {
      setDistanceConfirmed(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const requestData = new FormData();
      requestData.append('title', form.title);
      requestData.append('description', form.description);
      requestData.append('requested_at', new Date(form.requested_at).toISOString());
      requestData.append('location', form.location);
      requestData.append('professional_id', professional?.id);
      requestData.append('category', category);
      if (currentLocation) {
        requestData.append('latitude', currentLocation.latitude);
        requestData.append('longitude', currentLocation.longitude);
      }
      photos.forEach(photo => requestData.append('photos', photo));
      if (video) requestData.append('video', video);
      if (voice) requestData.append('voice', voice, 'voice-note.webm');
      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: requestData,
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

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = event => audioChunksRef.current.push(event.data);
      recorder.onstop = () => {
        setVoice(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
      };
      recorder.start();
      setRecording(true);
    } catch {
      alert('Microphone permission is required to record a voice note.');
    }
  };

  return (
    <div className="modal-overlay booking-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal booking-modal fade-up">
        <div className="booking-page-header">
          <div className="booking-page-intro">
            <span className="booking-kicker">SERVICE REQUEST</span>
          <h2 className="modal-title">Book a Service</h2>
          <p className="booking-page-subtitle">Tell us what you need and we’ll help the right professional get started.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
        <div className="booking-context-bar">
          <span className="booking-context-icon"><FileText size={18} /></span>
          <span><small>{professional ? 'YOUR SELECTED PROVIDER' : 'YOUR REQUEST'}</small><strong>{professional ? professional.full_name : `${category} professional`}</strong></span>
          <span className="booking-context-category">{professional?.category || category}</span>
        </div>

        <form onSubmit={handleSubmit} className="booking-form-layout">
          <div className="booking-form-main">
            <div className="booking-form-section-title"><span>01</span><div><strong>Tell us about the job</strong><small>Give the professional enough detail to help quickly.</small></div></div>
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
          </div>
          <div className="booking-form-side">
            <div className="booking-form-section-title"><span>02</span><div><strong>When and where</strong><small>Choose a convenient time and location.</small></div></div>
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
          <div className="form-group">
            <label htmlFor="requested_at">When are you expecting the professional?</label>
            <input
              id="requested_at"
              className="form-input"
              name="requested_at"
              type="datetime-local"
              min={new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)}
              value={form.requested_at}
              onChange={handleChange}
              required
            />
            {scheduleError && <p className="schedule-error">{scheduleError}</p>}
          </div>
          </div>
          <div className="booking-evidence">
            <div className="booking-evidence-title">Help the professional understand the problem (optional)</div>
            <div className="booking-media-grid">
              <label className="media-attachment-btn">
                <div className="media-attachment-icon-circle photo">
                  <ImagePlus size={24} strokeWidth={1.5} />
                </div>
                <span>Photos</span>
                <input type="file" accept="image/*" multiple onChange={event => setPhotos(Array.from(event.target.files || []).slice(0, 5))} />
              </label>

              <label className="media-attachment-btn">
                <div className="media-attachment-icon-circle video">
                  <Video size={24} strokeWidth={1.5} />
                </div>
                <span>Video</span>
                <input type="file" accept="video/*" onChange={event => setVideo(event.target.files?.[0] || null)} />
              </label>

              <button type="button" className={`media-attachment-btn ${recording ? 'recording' : ''}`} onClick={toggleRecording}>
                <div className={`media-attachment-icon-circle voice ${recording ? 'recording-active' : ''}`}>
                  {recording ? <Square size={22} fill="currentColor" /> : <Mic size={24} strokeWidth={1.5} />}
                </div>
                <span>{recording ? 'Stop' : 'Voice'}</span>
              </button>
            </div>
            {photos.length > 0 && <p className="media-selection">{photos.length} photo{photos.length > 1 ? 's' : ''} selected</p>}
            {video && <p className="media-selection">Video selected: {video.name}</p>}
            {voice && <p className="media-selection">Voice note recorded</p>}
          </div>
          {professional?.distance_from_user > 15 && !distanceConfirmed && (
            <div className="distance-warning" role="alert">
              <strong>This professional is {professional.distance_from_user.toFixed(2)} km away.</strong>
              <p>You are booking a professional who is more than 15 km from your location. Do you want to continue?</p>
              <div className="distance-warning-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>Cancel booking</button>
                <button type="button" className="btn-submit" onClick={() => setDistanceConfirmed(true)}>Continue</button>
              </div>
            </div>
          )}
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
