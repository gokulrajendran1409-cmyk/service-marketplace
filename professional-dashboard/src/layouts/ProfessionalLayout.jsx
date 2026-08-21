import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useProfessionalNotifications } from "../hooks/useProfessionalNotifications";
import { 
  Briefcase,
  LayoutDashboard, 
  ClipboardList, 
  User, 
  UserRound,
  Bell, 
  Settings,
  LogOut
} from 'lucide-react';

function ProfessionalLayout() {
  const navigate = useNavigate();
  const professional = JSON.parse(localStorage.getItem("professional") || "{}");
  const professionalId = professional.id;
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAllRead } = useProfessionalNotifications(professionalId);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("professionalToken");
    localStorage.removeItem("professional");
    navigate("/login");
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Briefcase size={20} />
          </div>
          <h2>ProDash</h2>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard className="nav-icon" /> Dashboard
          </NavLink>
          <NavLink to="/requests" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ClipboardList className="nav-icon" /> My Requests
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <User className="nav-icon" /> Profile
          </NavLink>
        </nav>
        <button className="professional-logout" onClick={logout}>
          <LogOut className="nav-icon" /> Logout
        </button>
      </aside>

      <main className="main-wrapper">
        <header className="topbar">
          <div className="topbar-search">
             {/* Empty for now, can add search later */}
          </div>
          <div className="topbar-actions">
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button 
                className="action-btn" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadCount > 0 && !showNotifications) {
                    markAllRead();
                  }
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead}>Mark all as read</button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                          <div className="notification-title">{n.title}</div>
                          <div className="notification-message">{n.message}</div>
                          <div className="notification-time">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="action-btn" title="Settings"><Settings size={20} /></button>
            <div className="current-professional" title={professional.email || "Professional account"}>
              <span className="current-professional-avatar"><UserRound size={15} /></span>
              <span>Hi, {professional.full_name || "Professional"}</span>
            </div>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default ProfessionalLayout;
