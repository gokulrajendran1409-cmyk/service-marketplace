import { useEffect, useState } from 'react';
import { Check, Edit3, Mail, MapPin, Phone, Save, UserRound } from 'lucide-react';
import { API } from '../constants';

function Profile({ user, onUserUpdate, onLogout }) {
  const [profile, setProfile] = useState(user || {});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: user?.phone || '', address: user?.address || '' });
  const [language, setLanguage] = useState(localStorage.getItem('preferredLanguage') || 'English');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setForm({ phone: data.phone || '', address: data.address || '' });
          onUserUpdate(data);
        }
      } catch { /* Keep cached profile visible when offline. */ }
    };
    loadProfile();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('userToken')}` },
        body: JSON.stringify(form)
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

  const changeLanguage = (value) => {
    setLanguage(value);
    localStorage.setItem('preferredLanguage', value);
    setMessage(`${value} selected`);
  };

  return (
    <div className="profile-page page-container">
      <div className="profile-page-header"><div><span className="profile-page-kicker">ACCOUNT</span><h1 className="page-title">My Profile</h1><p className="page-subtitle">Keep your details ready for every booking.</p></div><button className="profile-edit-btn" onClick={() => setEditing(!editing)}><Edit3 size={16} /> {editing ? 'Cancel' : 'Edit profile'}</button></div>
      <section className="profile-identity-card">
        <div className="profile-page-avatar">{profile.photo_url ? <img src={profile.photo_url} alt={profile.name} /> : <UserRound size={36} />}</div>
        <div><h2>{profile.name || 'Customer'}</h2><p>{profile.email || 'Email not available'}</p><span className="profile-member-label"><Check size={13} /> Customer account</span></div>
      </section>
      <form className="profile-details-card" onSubmit={saveProfile}>
        <div className="profile-card-heading"><div><span className="profile-page-kicker">PERSONAL DETAILS</span><h2>Contact information</h2></div>{editing && <button className="profile-save-btn" disabled={saving}><Save size={15} /> {saving ? 'Saving...' : 'Save changes'}</button>}</div>
        <div className="profile-fields-grid">
          <div className="profile-field"><Mail size={17} /><label>Email address<input value={profile.email || ''} readOnly /></label></div>
          <div className="profile-field"><Phone size={17} /><label>Phone number<input value={form.phone} readOnly={!editing} onChange={event => setForm({ ...form, phone: event.target.value })} /></label></div>
          <div className="profile-field profile-field-wide"><MapPin size={17} /><label>Address<input value={form.address} readOnly={!editing} placeholder="Add your service address" onChange={event => setForm({ ...form, address: event.target.value })} /></label></div>
        </div>
      </form>
      <section className="profile-preferences-card"><div><span className="profile-page-kicker">PREFERENCES</span><h2>Language</h2><p>Choose the language you prefer for your account.</p></div><select value={language} onChange={event => changeLanguage(event.target.value)}><option>English</option><option>Malayalam</option></select></section>
      {message && <div className="profile-feedback">{message}</div>}
      <button className="profile-logout-btn" onClick={onLogout}>Log out</button>
    </div>
  );
}

export default Profile;