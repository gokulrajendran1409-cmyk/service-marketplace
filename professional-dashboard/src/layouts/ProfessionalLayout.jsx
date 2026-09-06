import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  Briefcase, 
  Wallet,
  UserRound
} from 'lucide-react';

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home, end: true },
  { path: "/requests", label: "My Works", icon: Briefcase },
  { path: "/wallet", label: "My Wallet", icon: Wallet },
  { path: "/profile", label: "My Profile", icon: UserRound }
];

function ProfessionalLayout() {
  return (
    <div className="app-layout">
      <div className="app-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
          <NavLink 
            key={path}
            to={path} 
            className={({isActive}) => isActive ? "bottom-nav-item active" : "bottom-nav-item"} 
            end={end}
          >
            <span className="bottom-nav-pill">
              <Icon size={20} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{label}</span>
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default ProfessionalLayout;
