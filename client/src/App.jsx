import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/Home/Home";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import CustomerDashboard from "./pages/customer/Dashboard";
import ProfessionalDashboard from "./pages/professional/Dashboard";
import BookingPage from "./pages/BookingPage";
import NotFoundPage from "./pages/NotFound";
import ServicesPage from "./pages/Services";
import AboutPage from "./pages/About";
import HelpPage from "./pages/Help";


function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/book-service" element={<BookingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;