import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import { Wrench, LayoutGrid, ClipboardList, LogOut, UserRound } from 'lucide-react';
import Home from './pages/Home';
import Services from './pages/Services';
import MyRequests from './pages/MyRequests';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

import Notifications from './pages/Notifications';

const PAGES = [
  { id: 'home',     label: 'Home',     icon: LayoutGrid },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'requests', label: 'Requests', icon: ClipboardList },
  { id: 'profile',  label: 'Profile',  icon: UserRound },
];

// stage: 'landing' | 'auth' | 'app'
function App() {
  const [stage, setStage] = useState('landing');
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('userData');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setStage('app');
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('userToken', userToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    setStage('app');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setPage('home');
    setStage('landing');
  };

  if (stage === 'landing') {
    return (
      <Landing
        onGetStarted={() => setStage('auth')}
      />
    );
  }

  if (stage === 'auth') {
    return <Auth onLogin={handleLogin} />;
  }

  const navigate = (target) => setPage(target);

  return (
    <div className="app-layout">
      <div className="app-content">
        {page === 'home'          && <Home navigate={navigate} />}
        {page === 'services'      && <Services navigate={navigate} />}
        {page === 'requests'      && <MyRequests navigate={navigate} />}
        {page === 'notifications' && <Notifications navigate={navigate} />}
        {page === 'profile'  && (
          <div className="page-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <UserRound size={40} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{user?.name || 'Customer'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{user?.email}</p>
            
            <button className="btn-hire" onClick={handleLogout} style={{ background: '#FEE2E2', color: '#DC2626', width: '100%', padding: 16 }}>
              <LogOut size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`bottom-nav-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <Icon size={22} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;

