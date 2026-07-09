import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/Home/Home";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
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
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/professionals" element={<ProfessionalListing />} />
        <Route path="/professional/:id" element={<ProfessionalProfile />} />
        <Route path="/book/:id" element={<BookingFlow />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;