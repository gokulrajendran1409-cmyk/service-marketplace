import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/Home/Home";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import CustomerDashboard from "./pages/customer/Dashboard";
import ProfessionalDashboard from "./pages/professional/Dashboard";
import NotFoundPage from "./pages/NotFound";
import ServicesPage from "./pages/Services";
import AboutPage from "./pages/About";
import HelpPage from "./pages/Help";
import ProfessionalListing from "./pages/ProfessionalListing";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import BookingFlow from "./pages/BookingFlow";
import HowItWorks from "./pages/HowItWorks";
import BecomeProfessional from "./pages/BecomeProfessional";
import ProfessionalRegistration from "./pages/ProfessionalRegistration";
import ProfessionalLogin from "./pages/auth/ProfessionalLogin";
import AdminDashboard from "./pages/AdminDashboard";
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/professionals" element={<BecomeProfessional />} />
        <Route path="/professional/register" element={<ProfessionalRegistration />} />
        <Route path="/professional/login" element={<ProfessionalLogin />} />
        <Route path="/search-professionals" element={<ProfessionalListing />} />
        <Route path="/professional/:id" element={<ProfessionalProfile />} />
        <Route path="/book/:id" element={<BookingFlow />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;