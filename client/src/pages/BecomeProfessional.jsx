import { Link } from "react-router-dom";
import { CheckCircle2, Briefcase, DollarSign, Calendar, ArrowRight } from "lucide-react";

export default function BecomeProfessional() {
  const benefits = [
    {
      icon: <Briefcase className="h-8 w-8 text-emerald-600" />,
      title: "Be Your Own Boss",
      description: "Choose when, where, and how much you work. Set your own schedule."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
      title: "Earn More",
      description: "Keep 100% of your tips and get paid directly to your bank account."
    },
    {
      icon: <Calendar className="h-8 w-8 text-emerald-600" />,
      title: "Consistent Bookings",
      description: "We bring the customers to you. Focus on your work, not marketing."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="rounded-[36px] bg-slate-900 p-8 sm:p-16 text-center text-white mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">Grow Your Business with Servora</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Get verified, receive quality leads, and manage your work from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/professional/register" 
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 font-bold text-white transition hover:bg-emerald-500 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Join as a Professional <ArrowRight size={20} />
              </Link>
              <Link 
                to="/professional/login" 
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-8 py-4 font-bold text-white transition hover:bg-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Professional Login
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Why Join Servora?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">We provide the tools, support, and customers you need to grow your independent service business.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* How it Works Section */}
        <div className="rounded-[36px] bg-white p-8 sm:p-16 border border-slate-100 shadow-sm">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-12 text-center">How It Works</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative">
              <div className="text-5xl font-black text-emerald-100 absolute -top-6 -left-4 z-0">1</div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Register</h4>
                <p className="text-sm text-slate-600">Fill out the online application with your details and skills.</p>
              </div>
            </div>
            <div className="relative">
              <div className="text-5xl font-black text-emerald-100 absolute -top-6 -left-4 z-0">2</div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Upload Docs</h4>
                <p className="text-sm text-slate-600">Provide ID proof and professional certificates for verification.</p>
              </div>
            </div>
            <div className="relative">
              <div className="text-5xl font-black text-emerald-100 absolute -top-6 -left-4 z-0">3</div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Get Verified</h4>
                <p className="text-sm text-slate-600">Our admin team reviews your profile within 24-48 hours.</p>
              </div>
            </div>
            <div className="relative">
              <div className="text-5xl font-black text-emerald-100 absolute -top-6 -left-4 z-0">4</div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Start Earning</h4>
                <p className="text-sm text-slate-600">Accept bookings from the dashboard and get paid.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center pt-8 border-t border-slate-100">
            <Link 
              to="/professional/register" 
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 font-bold text-white transition hover:bg-slate-800"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
