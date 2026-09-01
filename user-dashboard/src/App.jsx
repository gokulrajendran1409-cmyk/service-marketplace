import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import { Wrench, House, ClipboardList, UserRound } from 'lucide-react';
import Home from './pages/Home';
import Services from './pages/Services';
import MyRequests from './pages/MyRequests';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

const PAGES = [
  { id: 'home',     label: 'Home',     icon: House },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'requests', label: 'My Bookings', icon: ClipboardList },
  { id: 'profile',  label: 'Profile',  icon: UserRound },
];

// stage: 'landing' | 'auth' | 'app'
function App() {
  const [stage, setStage] = useState('landing');
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [navigationGroup, setNavigationGroup] = useState(null);
  const [navigationCategory, setNavigationCategory] = useState(null);

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

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
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

  const navigate = (target, group = null, category = null) => {
    setNavigationGroup(target === 'services' ? group : null);
    setNavigationCategory(target === 'services' ? category : null);
    setPage(target);
  };

  return (
    <div className="app-layout">
      <div className="app-content">
        {page === 'home'          && <Home navigate={navigate} />}
        {page === 'services'      && <Services navigate={navigate} initialGroup={navigationGroup} initialCategory={navigationCategory} />}
        {page === 'requests'      && <MyRequests navigate={navigate} />}
        {page === 'notifications' && <Notifications navigate={navigate} />}
        {page === 'profile'  && <Profile user={user} onUserUpdate={updateUser} onLogout={handleLogout} />}
      </div>

      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`bottom-nav-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <span className="bottom-nav-pill">
              <Icon size={20} className="bottom-nav-icon" />
              {page === id && <span className="bottom-nav-label">{label}</span>}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;

