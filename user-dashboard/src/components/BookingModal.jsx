import { useEffect, useRef, useState } from 'react';
import {
  X, MapPin, FileText, Loader2, ImagePlus, Video, Mic, Square,
  Sparkles, Search, CheckCircle2, Navigation, Clock3, Calendar,
  ChevronDown, Info
} from 'lucide-react';
import { API } from '../constants';

// ── Nominatim location search ─────────────────────────────────────────────────
function LocationSearch({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 500);
  };

  const pick = (item) => {
    const label = item.display_name.split(',').slice(0, 3).join(', ');
    setQuery(label);
    onChange(label);
    setOpen(false);
    setResults([]);
  };

  const geolocate = () => {
    if (!navigator.geolocation) return;
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const label = data.display_name.split(',').slice(0, 3).join(', ');
          setQuery(label);
          onChange(label);
        } catch { onChange(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`); }
        finally { setSearching(false); }
      },
      () => setSearching(false),
      { timeout: 8000 }
    );
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[14px] px-3 py-3 focus-within:border-[#2E7D32] transition-colors">
        <MapPin size={17} className="text-[#2E7D32] shrink-0" />
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search or enter your address…"
          className="flex-1 text-[14px] font-medium outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />
        {searching
          ? <Loader2 size={16} className="text-gray-400 animate-spin shrink-0" />
          : (
            <button type="button" onClick={geolocate} title="Use my location"
              className="shrink-0 text-[#2E7D32] active:scale-90 transition-transform">
              <Navigation size={17} strokeWidth={2.5} />
            </button>
          )
        }
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-[16px] shadow-xl overflow-hidden">
          {results.map((item, i) => {
            const parts = item.display_name.split(',');
            return (
              <button
                key={item.place_id}
                type="button"
                onClick={() => pick(item)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-[#E8F5E9] transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <MapPin size={14} className="text-[#2E7D32] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#0A3D0A] truncate">{parts[0]}</p>
                  <p className="text-[11px] font-medium text-gray-400 truncate">{parts.slice(1, 3).join(',')}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main BookingModal ─────────────────────────────────────────────────────────
export function BookingModal({ professional, category, currentLocation, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requested_at: '',
    location: currentLocation
      ? currentLocation.placeName ||
        `Current location (${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)})`
      : '',
  });
  const [autoAssign, setAutoAssign] = useState(!professional);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [voice, setVoice] = useState(null);
  const [recording, setRecording] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [distanceConfirmed, setDistanceConfirmed] = useState(false);
  const [step, setStep] = useState(1); // 1 = details, 2 = schedule+location, 3 = confirm
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'requested_at') setScheduleError('');
  };

  const handleLocationChange = (val) => setForm(prev => ({ ...prev, location: val }));

  /* ── submit (UNCHANGED BACKEND LOGIC) ── */
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
    if (professional?.distance_from_user > 15 && !distanceConfirmed) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const requestData = new FormData();
      requestData.append('title', form.title);
      requestData.append('description', form.description);
      requestData.append('requested_at', new Date(form.requested_at).toISOString());
      requestData.append('location', form.location);
      requestData.append('professional_id', professional?.id || '');
      requestData.append('category', category);
      requestData.append('auto_assign', autoAssign ? 'true' : 'false');
      if (currentLocation) {
        requestData.append('latitude', currentLocation.latitude);
        requestData.append('longitude', currentLocation.longitude);
      }
      photos.forEach(photo => requestData.append('photos', photo));
      if (video) requestData.append('video', video);
      if (voice) requestData.append('voice', voice, 'voice-note.webm');

      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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

  /* ── voice recording (UNCHANGED) ── */
  const toggleRecording = async () => {
    if (recording) { mediaRecorderRef.current?.stop(); return; }
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

  const canProceed1 = form.title.trim().length > 0;
  const canProceed2 = form.location.trim().length > 0 && form.requested_at;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-[430px] bg-[#FFFBF0] rounded-t-[32px] overflow-hidden shadow-2xl font-['Inter',sans-serif]"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-widest mb-0.5">New Booking</p>
            <h2 className="text-[20px] font-bold text-[#0A3D0A] tracking-[-0.02em]">{category}</h2>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500 active:scale-90 transition-transform shadow-sm">
            <X size={18} />
          </button>
        </div>

        {/* Pro chip or Auto-assign toggle */}
        <div className="px-6 py-4">
          {professional && !autoAssign ? (
            <div className="flex items-center gap-3 bg-[#F4FBF4] border border-[#C8E6C9] rounded-[18px] p-3.5">
              <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-[17px] font-bold shrink-0">
                {professional.full_name?.charAt(0) || 'P'}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[#0A3D0A]">{professional.full_name}</p>
                <p className="text-[11px] text-[#4A6B4A]">{professional.category || category}</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoAssign(true)}
                className="text-[11px] font-bold text-[#2E7D32] bg-white border border-[#C8E6C9] px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAutoAssign(v => !v)}
              className={`w-full flex items-center gap-3 rounded-[18px] p-4 border transition-all active:scale-[0.98]
                ${autoAssign
                  ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-[0_4px_16px_rgba(46,125,50,0.3)]'
                  : 'bg-white border-gray-200 text-gray-700'}`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${autoAssign ? 'bg-white/20' : 'bg-[#E8F5E9]'}`}>
                <Sparkles size={22} className={autoAssign ? 'text-white' : 'text-[#2E7D32]'} strokeWidth={2} />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[14px] font-bold ${autoAssign ? 'text-white' : 'text-[#0A3D0A]'}`}>
                  {autoAssign ? '✓ Auto-Assign Expert' : 'Auto-Assign Expert'}
                </p>
                <p className={`text-[12px] leading-snug ${autoAssign ? 'text-white/80' : 'text-gray-500'}`}>
                  We'll find the nearest available expert
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                ${autoAssign ? 'border-white bg-white' : 'border-gray-300'}`}>
                {autoAssign && <CheckCircle2 size={16} className="text-[#2E7D32]" />}
              </div>
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pb-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold shrink-0 transition-all
                ${n < step ? 'bg-[#2E7D32] text-white' : n === step ? 'bg-[#0A3D0A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                {n < step ? '✓' : n}
              </div>
              <span className={`text-[11px] font-bold transition-colors ${n === step ? 'text-[#0A3D0A]' : 'text-gray-400'}`}>
                {n === 1 ? 'Job Info' : n === 2 ? 'Schedule' : 'Confirm'}
              </span>
              {n < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > n ? 'bg-[#2E7D32]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-8">

          {/* ── Step 1: Job Details ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-[#0A3D0A] uppercase tracking-widest mb-2 block">
                  Service Title *
                </label>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[14px] px-3 py-3 focus-within:border-[#2E7D32] transition-colors">
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Fix leaking bathroom pipe"
                    className="flex-1 text-[14px] font-medium outline-none bg-transparent text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#0A3D0A] uppercase tracking-widest mb-2 block">
                  Description <span className="text-gray-400 normal-case font-medium">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the problem or what needs to be done…"
                  className="w-full bg-white border border-gray-200 rounded-[14px] px-4 py-3 text-[14px] font-medium text-gray-800 placeholder-gray-400 outline-none resize-none focus:border-[#2E7D32] transition-colors"
                />
              </div>

              {/* Media */}
              <div>
                <label className="text-[12px] font-bold text-[#0A3D0A] uppercase tracking-widest mb-2 block">
                  Help us understand <span className="text-gray-400 normal-case font-medium">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[14px] py-3 text-[12px] font-bold text-gray-600 cursor-pointer active:scale-95 transition-transform hover:border-[#2E7D32] hover:text-[#2E7D32]">
                    <ImagePlus size={16} />
                    {photos.length > 0 ? `${photos.length} Photo${photos.length > 1 ? 's' : ''}` : 'Photos'}
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => setPhotos(Array.from(e.target.files || []).slice(0, 5))} />
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[14px] py-3 text-[12px] font-bold text-gray-600 cursor-pointer active:scale-95 transition-transform hover:border-[#2E7D32] hover:text-[#2E7D32]">
                    <Video size={16} />
                    {video ? 'Video ✓' : 'Video'}
                    <input type="file" accept="video/*" className="hidden"
                      onChange={e => setVideo(e.target.files?.[0] || null)} />
                  </label>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex-1 flex items-center justify-center gap-2 border rounded-[14px] py-3 text-[12px] font-bold transition-all active:scale-95
                      ${recording
                        ? 'bg-red-500 border-red-500 text-white animate-pulse'
                        : voice
                        ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
                        : 'bg-white border-gray-200 text-gray-600'}`}>
                    {recording ? <Square size={15} /> : <Mic size={16} />}
                    {recording ? 'Stop' : voice ? 'Recorded ✓' : 'Voice'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!canProceed1}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[#2E7D32] text-white rounded-[16px] text-[15px] font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(46,125,50,0.3)] mt-2">
                Continue to Schedule →
              </button>
            </div>
          )}

          {/* ── Step 2: Schedule & Address ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-[#0A3D0A] uppercase tracking-widest mb-2 block">
                  <Calendar size={13} className="inline mr-1.5" />
                  When do you need the professional? *
                </label>
                <div className="bg-white border border-gray-200 rounded-[14px] px-3 py-3 focus-within:border-[#2E7D32] transition-colors">
                  <input
                    id="requested_at"
                    name="requested_at"
                    type="datetime-local"
                    min={new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)}
                    value={form.requested_at}
                    onChange={handleChange}
                    required
                    className="w-full text-[14px] font-medium outline-none bg-transparent text-gray-800"
                  />
                </div>
                {scheduleError && (
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 mt-1.5">
                    <Info size={13} /> {scheduleError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#0A3D0A] uppercase tracking-widest mb-2 block">
                  <MapPin size={13} className="inline mr-1.5" />
                  Your Address *
                </label>
                <LocationSearch value={form.location} onChange={handleLocationChange} />
                <p className="text-[11px] font-medium text-gray-400 mt-1.5 ml-1 flex items-center gap-1">
                  <Navigation size={11} /> Tap the arrow icon to use your current location
                </p>
              </div>

              {/* Distance warning */}
              {professional?.distance_from_user > 15 && !distanceConfirmed && (
                <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-4">
                  <p className="text-[13px] font-bold text-amber-800 mb-1">
                    Professional is {professional.distance_from_user.toFixed(1)} km away
                  </p>
                  <p className="text-[12px] text-amber-700 mb-3">This is more than 15 km from your location. Additional travel charges may apply.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={onClose}
                      className="flex-1 py-2.5 border border-amber-300 rounded-[12px] text-[12px] font-bold text-amber-700">
                      Cancel
                    </button>
                    <button type="button" onClick={() => setDistanceConfirmed(true)}
                      className="flex-1 py-2.5 bg-amber-500 text-white rounded-[12px] text-[12px] font-bold">
                      Continue Anyway
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-200 bg-white text-[#0A3D0A] rounded-[16px] text-[14px] font-bold active:scale-[0.98] transition-all">
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!canProceed2}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-4 bg-[#2E7D32] text-white rounded-[16px] text-[14px] font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(46,125,50,0.3)]">
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Booking Summary</p>

                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-widest mb-0.5">Service</p>
                    <p className="text-[15px] font-bold text-[#0A3D0A]">{form.title}</p>
                    {form.description && <p className="text-[12px] text-gray-500 mt-0.5">{form.description}</p>}
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-widest mb-0.5">Date & Time</p>
                      <p className="text-[13px] font-bold text-[#0A3D0A]">
                        {form.requested_at
                          ? new Date(form.requested_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div>
                    <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-[13px] font-bold text-[#0A3D0A]">{form.location}</p>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div>
                    <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-widest mb-0.5">Expert</p>
                    <p className="text-[13px] font-bold text-[#0A3D0A]">
                      {autoAssign ? '⚡ Auto-assigned by Seva' : professional?.full_name || 'Selected expert'}
                    </p>
                  </div>

                  {(photos.length > 0 || video || voice) && (
                    <>
                      <div className="h-px bg-gray-100" />
                      <p className="text-[12px] font-medium text-gray-500">
                        {[
                          photos.length > 0 && `${photos.length} photo${photos.length > 1 ? 's' : ''}`,
                          video && 'video',
                          voice && 'voice note'
                        ].filter(Boolean).join(' · ')} attached
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border border-gray-200 bg-white text-[#0A3D0A] rounded-[16px] text-[14px] font-bold active:scale-[0.98] transition-all">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-[#FF7A00] text-white rounded-[16px] text-[15px] font-bold disabled:opacity-60 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(255,111,0,0.35)] flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> Booking…</>
                    : '🎉 Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
