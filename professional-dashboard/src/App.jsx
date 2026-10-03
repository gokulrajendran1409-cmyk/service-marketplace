import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from "react";
import "./App.css";
import ProfessionalLayout from "./layouts/ProfessionalLayout";
import Dashboard from "./pages/Dashboard";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Wallet from "./pages/Wallet";
import Reviews from "./pages/Reviews";
import SetupProfile from "./pages/SetupProfile";

function ProtectedRoute({ children, allowIncomplete = false }) {
  const token = localStorage.getItem("professionalToken");
  const professional = JSON.parse(localStorage.getItem("professional") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Force incomplete profiles to go to setup-profile
  if (professional?.verification_status === 'incomplete' && !allowIncomplete) {
    return <Navigate to="/setup-profile" replace />;
  }

  const location = useLocation();
  const isEditing = new URLSearchParams(location.search).get("edit") === "1";

  // Prevent completed profiles from going back to setup-profile (unless editing)
  if (professional?.verification_status !== 'incomplete' && allowIncomplete && !isEditing) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function HardwareBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = () => {
      if (location.pathname === "/" || location.pathname === "/login") {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    };
    CapacitorApp.addListener("backButton", handleBackButton);
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <HardwareBackButtonHandler />
      <Routes>
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup-profile" element={<ProtectedRoute allowIncomplete={true}><SetupProfile /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute allowIncomplete={false}><ProfessionalLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reviews" element={<Reviews />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
