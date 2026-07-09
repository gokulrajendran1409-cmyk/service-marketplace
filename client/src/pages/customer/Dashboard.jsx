import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Download, Star, RotateCw, MapPin, Search } from "lucide-react";

const mockUpcoming = [
  {
    id: "BKG-84920",
    service: "Plumbing - Leak Repair",
    proName: "Arun Kumar",
    date: "2026-07-15",
    time: "11:00 AM - 01:00 PM",
    status: "Confirmed",
    price: 352
  }
];

const mockPast = [
  {
    id: "BKG-77211",
    service: "AC Deep Cleaning",
    proName: "Navas AC Technician",
    date: "2026-06-22",
    status: "Completed",
    price: 1100,
    rating: 5
  },
  {
    id: "BKG-65492",
    service: "Wiring Repair",
    proName: "Jose Varghese",
    date: "2026-05-10",
    status: "Completed",
    price: 550,
    rating: null
  }
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 px-6 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Customer dashboard</p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">My Bookings</h1>
            <p className="mt-2 text-lg text-slate-600">Manage your active requests and past service history.</p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">
            <Search size={16} /> Book New Service
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-8 hide-scrollbar">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "upcoming" ? "border-emerald-700 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Upcoming ({mockUpcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "past" ? "border-emerald-700 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Past History ({mockPast.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "upcoming" && (
            mockUpcoming.length > 0 ? mockUpcoming.map(booking => (
              <div key={booking.id} className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase">{booking.status}</span>
                    <span className="text-sm font-bold text-slate-500">ID: {booking.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{booking.service}</h3>
                  <p className="text-slate-600 font-medium mb-4">with {booking.proName}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-flex">
                    <span className="flex items-center gap-2"><Clock size={16} className="text-emerald-600"/> {booking.date} at {booking.time}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 justify-end md:w-48">
                  <button className="w-full rounded-2xl bg-emerald-50 text-emerald-700 font-bold py-3 hover:bg-emerald-100 transition">Track Pro</button>
                  <button className="w-full rounded-2xl border border-rose-200 text-rose-600 font-bold py-3 hover:bg-rose-50 transition">Reschedule / Cancel</button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 rounded-3xl border border-slate-200 bg-white">
                <p className="text-slate-500">No upcoming bookings.</p>
              </div>
            )
          )}

          {activeTab === "past" && (
            mockPast.map(booking => (
              <div key={booking.id} className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-6 justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 size={14}/> {booking.status}</span>
                    <span className="text-sm font-bold text-slate-500">ID: {booking.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{booking.service}</h3>
                  <p className="text-slate-600 font-medium mb-1">with {booking.proName}</p>
                  <p className="text-slate-500 text-sm mb-4">Completed on {booking.date} • Total: ₹{booking.price}</p>
                </div>
                
                <div className="flex flex-wrap gap-3 items-center lg:justify-end">
                  {!booking.rating ? (
                    <button className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 text-amber-950 font-bold px-5 py-3 hover:bg-amber-500 transition shadow-sm">
                      <Star size={18} /> Rate & Review
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 text-amber-700 font-bold px-5 py-3 border border-amber-200">
                      <Star size={18} className="fill-amber-400 text-amber-400" /> Rated {booking.rating}/5
                    </div>
                  )}
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold px-5 py-3 hover:bg-slate-50 transition shadow-sm">
                    <Download size={18} /> Invoice
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 text-white font-bold px-5 py-3 hover:bg-emerald-800 transition shadow-sm">
                    <RotateCw size={18} /> Book Again
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
