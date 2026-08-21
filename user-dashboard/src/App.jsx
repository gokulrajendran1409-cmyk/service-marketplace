import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import { Wrench, LayoutGrid, ClipboardList, LogOut, UserRound } from 'lucide-react';
import Home from './pages/Home';
import Services from './pages/Services';
import MyRequests from './pages/MyRequests';
import Auth from './pages/Auth';

const PAGES = [
  { id: 'home',     label: 'Home',        icon: LayoutGrid },
  { id: 'services', label: 'Services',    icon: Wrench },
  { id: 'requests', label: 'My Requests', icon: ClipboardList },
];

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('userData');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('userToken', userToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setPage('home');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const navigate = (target) => setPage(target);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo"><Wrench size={18} /></div>
          ServiceHub
        </div>
        <div className="navbar-links">
          {PAGES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${page === id ? 'active' : ''}`}
              onClick={() => setPage(id)}
            >
              <Icon size={15} style={{ display: 'inline', marginRight: 6 }} />
              {label}
            </button>
          ))}
          <div className="current-user" title={user.email}>
            <span className="current-user-avatar"><UserRound size={15} /></span>
            <span>Hi, {user.name || 'Customer'}</span>
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--error)' }}>
            <LogOut size={15} style={{ display: 'inline', marginRight: 6 }} />
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      {page === 'home'     && <Home navigate={navigate} />}
      {page === 'services' && <Services navigate={navigate} />}
      {page === 'requests' && <MyRequests navigate={navigate} />}
    </>
  );
}

export default App;
