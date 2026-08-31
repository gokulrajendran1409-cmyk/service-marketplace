import { useEffect, useState } from 'react';
import './index.css';
import { CalendarDays, House, UserRound } from 'lucide-react';
import Home from './pages/Home';
import Services from './pages/Services';
import MyRequests from './pages/MyRequests';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import { ScheduleService, MyAddresses, Payment, BookingConfirmed } from './pages/BookingFlow';

const PAGES = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'requests', label: 'Bookings', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: UserRound }
];

function App() {
  const [stage, setStage] = useState('landing');
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [navigationGroup, setNavigationGroup] = useState(null);
  const [navigationCategory, setNavigationCategory] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const saved = localStorage.getItem('userData');
    if (token && saved) {
      setUser(JSON.parse(saved));
      setStage('app');
    }
  }, []);

  const login = (data, token) => {
    setUser(data);
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(data));
    setStage('app');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setPage('home');
    setStage('landing');
  };

  const updateUser = (data) => {
    setUser(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const navigate = (target, group = null, category = null) => {
    setNavigationGroup(target === 'services' ? group : null);
    setNavigationCategory(target === 'services' ? category : null);
    setPage(target);
  };

  if (stage === 'landing') return <Landing onGetStarted={() => setStage('auth')} />;
  if (stage === 'auth') return <Auth onLogin={login} />;

  const screens = {
    home: <Home navigate={navigate}/>,
    services: <Services navigate={navigate} initialGroup={navigationGroup} initialCategory={navigationCategory}/>,
    requests: <MyRequests navigate={navigate}/>,
    notifications: <Notifications navigate={navigate}/>,
    profile: <Profile user={user} onUserUpdate={updateUser} onLogout={logout} navigate={navigate}/>,
    schedule: <ScheduleService navigate={navigate}/>,
    addresses: <MyAddresses navigate={navigate}/>,
    payment: <Payment navigate={navigate}/>,
    confirmed: <BookingConfirmed navigate={navigate}/>
  };

  const showNav = ['home', 'requests', 'profile'].includes(page);

  return (
    <div className="app-layout">
      <main className="app-content">
        {screens[page]}
      </main>
      {showNav && (
        <nav className="fixed z-20 left-1/2 bottom-4 flex justify-around w-[calc(100%-38px)] max-w-[392px] h-[66px] p-1 rounded-[22px] bg-white shadow-[0_12px_30px_rgba(38,66,37,0.2)] -translate-x-1/2">
          {PAGES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`flex flex-col items-center justify-center gap-1 min-w-[72px] bg-transparent text-[10px] font-semibold transition-colors ${
                page === id ? 'text-[#2e7d32]' : 'text-[#94a098]'
              }`}
              onClick={() => setPage(id)}
            >
              <Icon size={21} strokeWidth={page === id ? 2.7 : 2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export default App;
