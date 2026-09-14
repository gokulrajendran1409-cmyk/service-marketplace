import { useEffect, useState } from 'react';
import {
  Check,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
  Plus,
  Trash2,
  House,
  Briefcase,
  Navigation,
  Loader2,
  X,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { API } from '../constants';
import { useTranslation } from 'react-i18next';

function Profile({ user, onUserUpdate, onLogout }) {
  const [profile, setProfile] = useState(user || {});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: user?.phone || '', address: user?.address || '' });
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language === 'ml' ? 'Malayalam' : 'English');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Multi-Address Management State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const initialNewAddress = {
    address_type: 'home',
    address_line: '',
    landmark: '',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    pincode: '',
    latitude: null,
    longitude: null,
    is_default: false,
  };
  const [newAddress, setNewAddress] = useState(initialNewAddress);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setForm({ phone: data.phone || '', address: data.address || '' });
        onUserUpdate(data);
      }
    } catch {
      /* Keep cached profile visible when offline. */
    }
  };

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        const response = await fetch(`${API}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setAddresses(data);
            localStorage.setItem('user_saved_addresses', JSON.stringify(data));
            setLoadingAddresses(false);
            return;
          }
        }
      }
    } catch {
      // Remote fetch failed, fall back to local storage
    }

    try {
      const cached = localStorage.getItem('user_saved_addresses');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
          setLoadingAddresses(false);
          return;
        }
      }
    } catch {}

    // Default sample addresses
    const fallbackList = [
      {
        id: 'default-home',
        address_type: 'home',
        address_line: 'Flat 4B, Emerald Heights, MG Road, Palayam',
        landmark: 'Opposite Government Secretariat',
        city: 'Thiruvananthapuram',
        state: 'Kerala',
        pincode: '695001',
        is_default: true,
      },
      {
        id: 'default-work',
        address_type: 'work',
        address_line: 'Building 2, Technopark Phase 3, Kazhakkoottam',
        landmark: 'Near Main Gate',
        city: 'Thiruvananthapuram',
        state: 'Kerala',
        pincode: '695583',
        is_default: false,
      },
    ];
    setAddresses(fallbackList);
    localStorage.setItem('user_saved_addresses', JSON.stringify(fallbackList));
    setLoadingAddresses(false);
  };

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save profile');
      setProfile(data);
      onUserUpdate(data);
      setEditing(false);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address_line.trim()) {
      setAddressError('Please enter street or house address details');
      return;
    }

    setSavingAddress(true);
    setAddressError('');
    setAddressSuccess('');

    const token = localStorage.getItem('userToken');
    let savedItem = null;

    try {
      if (token) {
        const res = await fetch(`${API}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAddress),
        });
        if (res.ok) {
          savedItem = await res.json();
        }
      }
    } catch (err) {
      console.warn('Network issue saving address to remote server:', err);
    }

    if (!savedItem) {
      savedItem = {
        ...newAddress,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
    }

    let nextAddresses = [];
    if (savedItem.is_default) {
      nextAddresses = [savedItem, ...addresses.map((a) => ({ ...a, is_default: false }))];
      setForm((prev) => ({ ...prev, address: savedItem.address_line }));
    } else {
      nextAddresses = [savedItem, ...addresses];
    }

    setAddresses(nextAddresses);
    localStorage.setItem('user_saved_addresses', JSON.stringify(nextAddresses));

    setAddressSuccess(`Added new ${newAddress.address_type.toUpperCase()} address!`);
    setNewAddress(initialNewAddress);
    setShowAddModal(false);
    setSavingAddress(false);
    setTimeout(() => setAddressSuccess(''), 4000);
  };

  const handleDeleteAddress = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this address?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('userToken');
    try {
      if (token && typeof id === 'number') {
        await fetch(`${API}/addresses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn('Could not delete from remote server:', err);
    }

    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    localStorage.setItem('user_saved_addresses', JSON.stringify(filtered));
  };

  const handleSetDefault = async (addr) => {
    const token = localStorage.getItem('userToken');
    try {
      if (token && typeof addr.id === 'number') {
        await fetch(`${API}/addresses/${addr.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_default: true }),
        });
      }
    } catch (err) {
      console.warn('Could not update default on remote server:', err);
    }

    const updated = addresses.map((a) => ({
      ...a,
      is_default: a.id === addr.id,
    }));
    setAddresses(updated);
    localStorage.setItem('user_saved_addresses', JSON.stringify(updated));
    setForm((prev) => ({ ...prev, address: addr.address_line }));
    setAddressSuccess(`Set ${addr.address_type.toUpperCase()} as default address!`);
    setTimeout(() => setAddressSuccess(''), 3000);
  };

  const handleDetectGpsForNewAddress = () => {
    if (!navigator.geolocation) {
      setAddressError('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    setAddressError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
          );
          if (!res.ok) throw new Error('Geocoding lookup failed');
          const data = await res.json();
          const a = data.address || {};
          const street = [a.building, a.house_number, a.road, a.pedestrian, a.suburb]
            .filter(Boolean)
            .join(', ');
          const landmark = a.neighbourhood || a.suburb ? `Near ${a.neighbourhood || a.suburb}` : '';
          const city = a.city || a.town || a.village || 'Thiruvananthapuram';
          const state = a.state || 'Kerala';
          const pincode = a.postcode || '';

          setNewAddress((prev) => ({
            ...prev,
            address_line: street || data.display_name || `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            landmark: landmark || prev.landmark,
            city,
            state,
            pincode: pincode || prev.pincode,
            latitude: lat,
            longitude: lon,
          }));
        } catch {
          setNewAddress((prev) => ({
            ...prev,
            address_line: `Current GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: lat,
            longitude: lon,
          }));
        } finally {
          setDetectingGps(false);
        }
      },
      () => {
        setDetectingGps(false);
        setAddressError('Could not detect GPS position. Please check your browser location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const changeLanguage = (value) => {
    setLanguage(value);
    const langCode = value === 'Malayalam' ? 'ml' : 'en';
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferredLanguage', value);
  };

  return (
    <div className="profile-page page-container">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <span className="profile-page-kicker">{t('profile.account')}</span>
          <h1 className="page-title">{t('profile.title')}</h1>
          <p className="page-subtitle">{t('profile.subtitle')}</p>
        </div>
        <button className="profile-edit-btn" onClick={() => setEditing(!editing)}>
          <Edit3 size={16} /> {editing ? t('profile.cancel') : t('profile.edit_profile')}
        </button>
      </div>

      {/* Identity Card */}
      <section className="profile-identity-card">
        <div className="profile-page-avatar">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} />
          ) : (
            <UserRound size={36} />
          )}
        </div>
        <div>
          <h2>{profile.name || 'Customer'}</h2>
          <p>{profile.email || 'Email not available'}</p>
          <span className="profile-member-label">
            <Check size={13} /> {t('profile.customer_account')}
          </span>
        </div>
      </section>

      {/* Contact Details Card */}
      <form className="profile-details-card" onSubmit={saveProfile}>
        <div className="profile-card-heading">
          <div>
            <span className="profile-page-kicker">{t('profile.personal_details')}</span>
            <h2>{t('profile.contact_info')}</h2>
          </div>
          {editing && (
            <button className="profile-save-btn" disabled={saving}>
              <Save size={15} /> {saving ? t('profile.saving') : t('profile.save_changes')}
            </button>
          )}
        </div>
        <div className="profile-fields-grid">
          <div className="profile-field">
            <Mail size={17} />
            <label>
              {t('profile.email')}
              <input value={profile.email || ''} readOnly />
            </label>
          </div>
          <div className="profile-field">
            <Phone size={17} />
            <label>
              {t('profile.phone')}
              <input
                value={form.phone}
                readOnly={!editing}
                placeholder="Add phone number"
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
          </div>
          <div className="profile-field profile-field-wide">
            <MapPin size={17} />
            <label>
              {t('profile.address')} (Primary)
              <input
                value={form.address}
                readOnly={!editing}
                placeholder={t('profile.add_address')}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />
            </label>
          </div>
        </div>
      </form>

      {/* ──────── SAVED ADDRESSES SECTION (HOME, WORK, OTHER) ──────── */}
      <section className="profile-addresses-card">
        <div className="profile-card-heading">
          <div>
            <span className="profile-page-kicker">Delivery & Service Locations</span>
            <h2>Saved Addresses</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>
              Manage multiple addresses categorized as Home, Work, or Other.
            </p>
          </div>
          <button
            type="button"
            className="profile-add-address-btn"
            onClick={() => {
              setAddressError('');
              setShowAddModal(true);
            }}
          >
            <Plus size={16} /> Add New Address
          </button>
        </div>

        {addressSuccess && (
          <div className="profile-address-alert success">
            <CheckCircle2 size={16} />
            <span>{addressSuccess}</span>
          </div>
        )}

        {loadingAddresses ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 0', color: 'var(--text-secondary)' }}>
            <Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading addresses...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="profile-address-empty">
            <MapPin size={32} color="#94A3B8" />
            <p>No saved addresses yet.</p>
            <small>Add your home or office address to book services quickly.</small>
          </div>
        ) : (
          <div className="profile-address-list">
            {addresses.map((addr) => {
              const type = (addr.address_type || 'home').toLowerCase();
              const TypeIcon = type === 'work' ? Briefcase : type === 'home' ? House : MapPin;

              return (
                <div key={addr.id} className={`profile-address-item ${addr.is_default ? 'is-default' : ''}`}>
                  <div className={`profile-address-icon-box ${type}`}>
                    <TypeIcon size={18} />
                  </div>
                  <div className="profile-address-info">
                    <div className="profile-address-header-row">
                      <span className={`profile-address-pill ${type}`}>
                        {type.toUpperCase()}
                      </span>
                      {addr.is_default && (
                        <span className="profile-address-default-badge">
                          <Star size={11} fill="#0D9488" /> Default
                        </span>
                      )}
                    </div>
                    <p className="profile-address-street">{addr.address_line}</p>
                    {(addr.landmark || addr.city) && (
                      <p className="profile-address-sub">
                        {[
                          addr.landmark ? `Landmark: ${addr.landmark}` : '',
                          addr.city,
                          addr.state,
                          addr.pincode ? `PIN: ${addr.pincode}` : '',
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}
                    {addr.latitude && addr.longitude && (
                      <span className="profile-address-gps-tag">
                        📍 GPS: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}
                      </span>
                    )}
                  </div>
                  <div className="profile-address-actions">
                    {!addr.is_default && (
                      <button
                        type="button"
                        className="profile-address-default-btn"
                        title="Set as default address"
                        onClick={() => handleSetDefault(addr)}
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      type="button"
                      className="profile-address-delete-btn"
                      title="Delete address"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Preferences Card */}
      <section className="profile-preferences-card">
        <div>
          <span className="profile-page-kicker">{t('profile.preferences')}</span>
          <h2>{t('profile.language')}</h2>
          <p>{t('profile.choose_language')}</p>
        </div>
        <select value={language} onChange={(event) => changeLanguage(event.target.value)}>
          <option>English</option>
          <option>Malayalam</option>
        </select>
      </section>

      {message && <div className="profile-feedback">{message}</div>}

      <button className="profile-logout-btn" onClick={onLogout}>
        {t('profile.logout')}
      </button>

      {/* ──────── ADD NEW ADDRESS MODAL ──────── */}
      {showAddModal && (
        <div className="address-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="address-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="address-modal-header">
              <div>
                <h3>Add New Address</h3>
                <p>Save address for quick selection during service bookings</p>
              </div>
              <button
                type="button"
                className="address-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {addressError && (
              <div className="profile-address-alert error">
                <AlertCircle size={16} />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleAddAddress} className="address-modal-form">
              {/* Category Selector: Home, Work, Other */}
              <div className="address-form-group">
                <label className="address-modal-label">Address Category</label>
                <div className="address-type-selector">
                  <button
                    type="button"
                    className={`address-type-btn ${newAddress.address_type === 'home' ? 'active home' : ''}`}
                    onClick={() => setNewAddress({ ...newAddress, address_type: 'home' })}
                  >
                    <House size={16} />
                    <span>Home</span>
                  </button>
                  <button
                    type="button"
                    className={`address-type-btn ${newAddress.address_type === 'work' ? 'active work' : ''}`}
                    onClick={() => setNewAddress({ ...newAddress, address_type: 'work' })}
                  >
                    <Briefcase size={16} />
                    <span>Work</span>
                  </button>
                  <button
                    type="button"
                    className={`address-type-btn ${newAddress.address_type === 'other' ? 'active other' : ''}`}
                    onClick={() => setNewAddress({ ...newAddress, address_type: 'other' })}
                  >
                    <MapPin size={16} />
                    <span>Other</span>
                  </button>
                </div>
              </div>

              {/* Quick GPS auto-fill button */}
              <button
                type="button"
                className="address-gps-detect-btn"
                onClick={handleDetectGpsForNewAddress}
                disabled={detectingGps}
              >
                {detectingGps ? (
                  <>
                    <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    Detecting current GPS position...
                  </>
                ) : (
                  <>
                    <Navigation size={16} />
                    Auto-Fill via Current GPS Location
                  </>
                )}
              </button>

              {/* Address Line */}
              <div className="address-form-group">
                <label className="address-modal-label">
                  Flat / House No. / Building / Street *
                </label>
                <input
                  type="text"
                  className="address-modal-input"
                  required
                  placeholder="e.g. Flat 3B, Sunshine Apartments, MG Road"
                  value={newAddress.address_line}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                />
              </div>

              {/* Landmark */}
              <div className="address-form-group">
                <label className="address-modal-label">Landmark / Directions (Optional)</label>
                <input
                  type="text"
                  className="address-modal-input"
                  placeholder="e.g. Opposite City Hospital, 3rd Floor"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                />
              </div>

              {/* City & State */}
              <div className="address-form-grid-2">
                <div className="address-form-group">
                  <label className="address-modal-label">City</label>
                  <input
                    type="text"
                    className="address-modal-input"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div className="address-form-group">
                  <label className="address-modal-label">Postal Pincode</label>
                  <input
                    type="text"
                    className="address-modal-input"
                    placeholder="e.g. 695001"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  />
                </div>
              </div>

              {/* Default checkbox */}
              <label className="address-default-checkbox-label">
                <input
                  type="checkbox"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                />
                <span>Set as default delivery & booking address</span>
              </label>

              {/* Actions */}
              <div className="address-modal-actions">
                <button
                  type="button"
                  className="address-modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="address-modal-submit-btn"
                  disabled={savingAddress}
                >
                  {savingAddress ? (
                    <>
                      <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Address'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;