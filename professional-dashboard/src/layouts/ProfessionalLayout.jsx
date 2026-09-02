import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  UserRound
} from 'lucide-react';

function ProfessionalLayout() {
  return (
    <div className="app-layout">
      <div className="app-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "bottom-nav-item active" : "bottom-nav-item"} end>
          <span className="bottom-nav-pill">
            <LayoutDashboard size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">Dashboard</span>
          </span>
        </NavLink>
        <NavLink to="/requests" className={({isActive}) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
          <span className="bottom-nav-pill">
            <ClipboardList size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">Requests</span>
          </span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
          <span className="bottom-nav-pill">
            <UserRound size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">Profile</span>
          </span>
        </NavLink>
      </nav>
    </div>
  );
}

export default ProfessionalLayout;
