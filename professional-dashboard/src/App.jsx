import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import ProfessionalLayout from "./layouts/ProfessionalLayout";
import Dashboard from "./pages/Dashboard";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import Registration from "./pages/Registration";
import Login from "./pages/Login";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("professionalToken");
  const professional = JSON.parse(localStorage.getItem("professional") || "null");

  if (!token || professional?.verification_status !== "verified") {
    localStorage.removeItem("professionalToken");
    localStorage.removeItem("professional");
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><ProfessionalLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
