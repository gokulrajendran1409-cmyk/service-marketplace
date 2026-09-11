import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import './App.css';
import { Wrench, House, ClipboardList, UserRound } from 'lucide-react';
import Home from './pages/Home';
import Services from './pages/Services';
import BrowseProfessionals from './pages/BrowseProfessionals';
import MyRequests from './pages/MyRequests';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ServiceAcceptedModal from './components/ServiceAcceptedModal';
import { API } from './constants';

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

  // Acceptance notification state & unread notifications count
  const [acceptedNotification, setAcceptedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const dismissedAcceptedIds = useRef(new Set());
  const appContentRef = useRef(null);

  // Helper: decode JWT expiry without a library
  const isTokenExpired = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch { return true; }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUser  = localStorage.getItem('userData');
    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        // Token expired — clear storage and show landing
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        return;
      }
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
    setAcceptedNotification(null);
    setPage('home');
    setStage('landing');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const scrollAppToTop = () => {
    appContentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigate = (target, group = null, category = null) => {
    setNavigationGroup(target === 'services' ? group : null);
    setNavigationCategory(target === 'services' || target === 'professionals' ? category : null);
    setPage(target);
  };

  useEffect(() => {
    scrollAppToTop();
  }, [page]);

  // Check backend notifications recorded in database
  const checkBackendNotifications = useCallback(async () => {
    const activeToken = token || localStorage.getItem('userToken');
    if (!activeToken) return;

    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.notifications || [];
      setUnreadCount(data.unreadCount || 0);

      // Find any unread request acceptance notification recorded in backend
      const unreadAccepted = list.find(
        item => item.type === 'request_accepted' && !item.is_read && !dismissedAcceptedIds.current.has(item.id)
      );

      if (unreadAccepted && !acceptedNotification) {
        setAcceptedNotification(unreadAccepted);
      }
    } catch (err) {
      console.error('Failed to sync backend notifications:', err);
    }
  }, [token, acceptedNotification]);

  // Establish persistent global SSE connection & periodic sync
  useEffect(() => {
    const activeToken = token || localStorage.getItem('userToken');
    if (!activeToken || stage !== 'app') return;

    // Bail out early if token is already expired
    if (isTokenExpired(activeToken)) {
      handleLogout();
      return;
    }

    // Initial check on mounting/login
    checkBackendNotifications();

    let eventSource = null;
    let reconnectTimeout = null;

    const connect = () => {
      try {
        const currentToken = token || localStorage.getItem('userToken');
        if (!currentToken || isTokenExpired(currentToken)) {
          handleLogout();
          return;
        }

        eventSource = new EventSource(`${API}/notifications/stream?token=${currentToken}`);

        eventSource.addEventListener('requestAccepted', (e) => {
          try {
            const payload = JSON.parse(e.data);
            const notif = payload.notification || payload;
            if (notif && !dismissedAcceptedIds.current.has(notif.id)) {
              setAcceptedNotification(notif);
              setUnreadCount(prev => prev + 1);
            }
          } catch (err) {
            console.error('Error handling requestAccepted SSE:', err);
          }
        });

        eventSource.addEventListener('notification', (e) => {
          try {
            const notif = JSON.parse(e.data);
            if (notif.type === 'request_accepted' && !dismissedAcceptedIds.current.has(notif.id)) {
              setAcceptedNotification(notif);
            }
            setUnreadCount(prev => prev + 1);
          } catch (err) {
            console.error('Error handling notification SSE:', err);
          }
        });

        eventSource.addEventListener('requestUpdate', () => {
          checkBackendNotifications();
        });

        eventSource.onerror = () => {
          eventSource.close();
          // Check if the token is still valid before reconnecting
          const t = token || localStorage.getItem('userToken');
          if (!t || isTokenExpired(t)) {
            // Token expired — force logout
            handleLogout();
            return;
          }
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error('Failed to connect to notifications SSE:', err);
      }
    };

    connect();
    const interval = setInterval(checkBackendNotifications, 20000);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, token]);

  // Actions on the Accepted Notification Modal
  const markNotificationAsReadInBackend = async (notificationId) => {
    const activeToken = token || localStorage.getItem('userToken');
    if (!activeToken || !notificationId) return;
    try {
      await fetch(`${API}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleTrackAccepted = (notif) => {
    if (notif?.id) {
      dismissedAcceptedIds.current.add(notif.id);
      markNotificationAsReadInBackend(notif.id);
    }
    setAcceptedNotification(null);
    setUnreadCount(prev => Math.max(0, prev - 1));
    navigate('requests');
  };

  const handleDismissAccepted = (notif) => {
    if (notif?.id) {
      dismissedAcceptedIds.current.add(notif.id);
      markNotificationAsReadInBackend(notif.id);
    }
    setAcceptedNotification(null);
    setUnreadCount(prev => Math.max(0, prev - 1));
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

  return (
    <div className="app-layout">
      <div className="app-content" ref={appContentRef}>
        {page === 'home'          && <Home navigate={navigate} unreadCount={unreadCount} />}
        {page === 'services'      && <Services navigate={navigate} initialGroup={navigationGroup} initialCategory={navigationCategory} user={user} unreadCount={unreadCount} />}
        {page === 'professionals' && <BrowseProfessionals navigate={navigate} initialCategory={navigationCategory} />}
        {page === 'requests'      && <MyRequests navigate={navigate} />}
        {page === 'notifications' && <Notifications navigate={navigate} />}
        {page === 'profile'       && <Profile user={user} onUserUpdate={updateUser} onLogout={handleLogout} />}
      </div>

      {/* Global Creative Notification Modal for Service Acceptance */}
      {acceptedNotification && (
        <ServiceAcceptedModal
          notification={acceptedNotification}
          onTrack={handleTrackAccepted}
          onDismiss={handleDismissAccepted}
        />
      )}

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
