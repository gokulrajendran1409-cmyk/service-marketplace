import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultMapCenter = [20.5937, 78.9629];
const registrationMarker = L.divIcon({ className: 'registration-map-marker', html: '📍', iconSize: [32, 32], iconAnchor: [16, 32] });

function RegistrationMapClick({ onSelect }) {
  useMapEvents({ click: event => onSelect(event.latlng.lat, event.latlng.lng) });
  return null;
}

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    date_of_birth: '',
    category: '',
    experience_years: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: ''
  });

  const [idProof, setIdProof] = useState(null);
  const [certificate, setCertificate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');

  const idInputRef = useRef(null);
  const certInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    setLocationStatus('geocoding');
    setLocationError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      if (!response.ok) throw new Error('Unable to identify this location.');
      const data = await response.json();
      const address = data.address || {};
      const cityName = address.city
        || address.town
        || address.village
        || address.municipality
        || address.city_district
        || address.district
        || address.county
        || address.state_district;
      setFormData(previous => ({
        ...previous,
        address: [address.house_number, address.road].filter(Boolean).join(' ') || data.display_name || previous.address,
        city: cityName || previous.city,
        state: address.state || previous.state,
        pincode: address.postcode || previous.pincode,
      }));
      setSelectedLocation({ latitude, longitude });
      setLocationStatus('ready');
    } catch (geocodeError) {
      setLocationStatus('error');
      setLocationError(geocodeError.message);
    }
  };

  const enableLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Location services are not supported by this browser.');
      return;
    }
    setLocationStatus('requesting');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      position => reverseGeocode(position.coords.latitude, position.coords.longitude),
      locationError => {
        setLocationStatus('error');
        setLocationError(locationError.code === locationError.PERMISSION_DENIED
          ? 'Please allow location access or select a point on the map.'
          : 'We could not retrieve your location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      // append text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      // append files
      if (idProof) data.append('id_proof', idProof);
      if (certificate) data.append('certificate', certificate);

      const response = await fetch('service-marketplace-af7p.onrender.com/api/professionals/register', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Registration failed');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registration-wrapper">
        <div className="registration-card" style={{ textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 20px' }} />
          <h2>Registration Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Status: Pending admin approval. The dashboard will be available after the admin accepts your registration.</p>
          <button className="submit-btn" onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-wrapper">
      <div className="registration-card">
        <div className="brand-header">
          <div className="brand-icon">
            <Briefcase size={24} />
          </div>
          <h1>Professional Registration</h1>
          <p>Join our platform to offer your services</p>
          <p>Already registered? <Link to="/login">Log in</Link></p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--error)' }}>{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" placeholder="John Doe" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="9876543210" required />
          </div>
          <div className="form-group full-width">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" minLength="6" placeholder="At least 6 characters" required />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label>Professional Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" required>
              <option value="">Select Category...</option>
              <option value="Plumbing">🔧 Plumbing</option>
              <option value="Electrical">⚡ Electrical</option>
              <option value="AC & Appliance Repair">❄️ AC & Appliance Repair</option>
              <option value="Carpentry">🪚 Carpentry</option>
              <option value="Painting">🎨 Painting</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Home Repair & Maintenance">🔨 Home Repair & Maintenance</option>
              <option value="CCTV & Security">📹 CCTV & Security</option>
              <option value="Vehicle Services">🚗 Vehicle Services</option>
              <option value="Gardening & Landscaping">🌳 Gardening & Landscaping</option>
              <option value="Computer & Mobile Repair">💻 Computer & Mobile Repair</option>
              <option value="Photography & Videography">📷 Photography & Videography</option>
            </select>
          </div>

          <div className="form-group">
            <label>Experience (Years)</label>
            <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} min="0" className="form-input" placeholder="5" required />
          </div>

          <div className="form-group full-width">
            <label>Service Location</label>
            <div className="registration-location-tools">
              <button type="button" className="registration-location-btn" onClick={enableLocation} disabled={locationStatus === 'requesting' || locationStatus === 'geocoding'}>
                {locationStatus === 'requesting' || locationStatus === 'geocoding' ? <Loader2 size={15} className="spin" /> : <MapPin size={15} />}
                {locationStatus === 'requesting' ? 'Finding location...' : locationStatus === 'geocoding' ? 'Reading address...' : 'Enable location'}
              </button>
              <span>or click a point on the map</span>
            </div>
            {locationError && <p className="registration-location-error">{locationError}</p>}
            <div className="registration-map-wrap">
              <MapContainer className="registration-map" center={selectedLocation ? [selectedLocation.latitude, selectedLocation.longitude] : defaultMapCenter} zoom={selectedLocation ? 15 : 5} scrollWheelZoom>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RegistrationMapClick onSelect={reverseGeocode} />
                {selectedLocation && <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} icon={registrationMarker} />}
              </MapContainer>
            </div>
            {locationStatus === 'ready' && <p className="registration-location-success">Location selected. Address fields were filled automatically and can still be edited.</p>}
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="123 Main St" />
          </div>

          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" placeholder="New York" />
          </div>

          <div className="form-group">
            <label>State</label>
            <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" placeholder="NY" />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="form-input" placeholder="10001" />
          </div>

          <div className="form-group full-width">
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="form-input" placeholder="Tell us about your professional background..."></textarea>
          </div>

          <div className="form-group full-width" style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Verification Documents</h3>
          </div>

          <div className="form-group">
            <label>Upload ID Proof</label>
            <div
              onClick={() => idInputRef.current.click()}
              style={{
                border: idProof ? '2px solid var(--success)' : '2px dashed var(--border-light)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                background: idProof ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-base)',
                cursor: 'pointer',
                color: idProof ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              <p style={{ fontSize: '14px', margin: 0 }}>{idProof ? idProof.name : 'Click to upload ID Proof'}</p>
              <input type="file" ref={idInputRef} onChange={(e) => handleFileChange(e, setIdProof)} style={{ display: 'none' }} accept="image/*,.pdf" />
            </div>
          </div>

          <div className="form-group">
            <label>Professional Certificate</label>
            <div
              onClick={() => certInputRef.current.click()}
              style={{
                border: certificate ? '2px solid var(--success)' : '2px dashed var(--border-light)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                background: certificate ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-base)',
                cursor: 'pointer',
                color: certificate ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              <p style={{ fontSize: '14px', margin: 0 }}>{certificate ? certificate.name : 'Click to upload Certificate'}</p>
              <input type="file" ref={certInputRef} onChange={(e) => handleFileChange(e, setCertificate)} style={{ display: 'none' }} accept="image/*,.pdf" />
            </div>
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

