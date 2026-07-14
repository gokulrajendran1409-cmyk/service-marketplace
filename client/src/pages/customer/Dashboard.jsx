import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Clock,
  ChevronRight,
  Heart,
  MessageCircle,
  CreditCard,
  User,
  Settings,
  LogOut,
  Zap,
  Wrench,
  Snowflake,
  FileText,
  Paintbrush,
  Car,
  Star,
  CalendarDays,
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sidebarLinks = [
  { label: "Dashboard", icon: User, active: true },
  { label: "My Bookings", icon: CalendarDays },
  { label: "Saved Professionals", icon: Heart },
  { label: "Messages", icon: MessageCircle },
  { label: "Notifications", icon: Bell },
  { label: "Payments", icon: CreditCard },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
  { label: "Logout", icon: LogOut, action: "logout" }
];

const quickServices = [
  { label: "Electrician", icon: Zap, color: "bg-emerald-50 text-emerald-700" },
  { label: "Plumber", icon: Wrench, color: "bg-sky-50 text-sky-700" },
  { label: "AC Repair", icon: Snowflake, color: "bg-cyan-50 text-cyan-700" },
  { label: "Cleaning", icon: FileText, color: "bg-violet-50 text-violet-700" },
  { label: "Painter", icon: Paintbrush, color: "bg-orange-50 text-orange-700" },
  { label: "Mechanic", icon: Car, color: "bg-slate-50 text-slate-700" }
];

const bookings = [
  {
    id: "BKG-94218",
    service: "Electrician",
    proName: "Arun Kumar",
    time: "Today • 3:00 PM",
    status: "On the Way",
    statusColor: "bg-emerald-100 text-emerald-700",
    rating: 4.9,
    price: 399
  },
  {
    id: "BKG-83417",
    service: "AC Repair",
    proName: "Sneha Das",
    time: "Tomorrow • 11:00 AM",
    status: "Confirmed",
    statusColor: "bg-blue-100 text-blue-700"
  },
  {
    id: "BKG-77341",
    service: "Cleaning",
    proName: "Maya Pillai",
    time: "Jun 28 • 10:00 AM",
    status: "Scheduled",
    statusColor: "bg-amber-100 text-amber-700"
  }
];

const activityTabs = [
  { key: "upcoming", label: "Upcoming" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" }
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const firstName = user?.fullName?.split(" ")[0] || "User";

  return (
    <main className="min-h-screen bg-[#f8f5ef] pt-32 pb-12">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-sm xl:block xl:self-start xl:sticky xl:top-28">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Service Hub</p>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950">My Space</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Quick access to your bookings, chats, and preferences.</p>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action === "logout" ? handleLogout : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    item.active ? "bg-emerald-700 text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                    item.active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    <Icon size={18} />
                  </span>
                  <span className="text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Service Hub</p>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-950">My Space</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.label}
                    onClick={item.action === "logout" ? handleLogout : undefined}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon size={16} />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Welcome back</p>
                <h1 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">Good Morning, {firstName} 👋</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage your profile, track bookings, and connect with professionals.</p>
              </div>

              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full border-2 border-emerald-100 object-cover shadow-sm" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-100 bg-emerald-50 text-xl font-bold text-emerald-700 shadow-sm">
                  {firstName[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info Section */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{user?.email || "N/A"}</p>
                <p className={`mt-2 text-xs font-semibold flex items-center gap-1 ${user?.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user?.emailVerified ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-500">Phone</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{user?.phone || "N/A"}</p>
                <p className={`mt-2 text-xs font-semibold flex items-center gap-1 ${user?.phoneVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user?.phoneVerified ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                  {user?.phoneVerified ? "Verified" : "Unverified"}
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-500">Member Since</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-500">Last Login</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "N/A"}
                </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {user?.roles?.customer && !user?.roles?.professional && (
                  <Link
                    to="/professional/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                  >
                    Become a Professional
                  </Link>
                )}
                <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                  <Bell size={18} /> Notifications
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 items-center lg:grid-cols-[1.35fr_0.95fr]">
              <div className="relative rounded-[20px] bg-slate-50 px-3 py-2 shadow-sm border border-slate-100">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></div>
                <input
                  className="w-full rounded-[20px] bg-transparent py-2 pl-11 pr-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                  placeholder="Search Services..."
                  aria-label="Search services"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link to="/services" className="rounded-[20px] bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                  Search
                </Link>
                <button className="rounded-[20px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">Track</button>
                <button className="rounded-[20px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">Messages</button>
              </div>
            </div>
          </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <article className="xl:order-2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Quick Services</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {quickServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button key={service.label} className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white">
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${service.color}`}>
                        <Icon size={20} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{service.label}</p>
                        <p className="text-sm text-slate-500">Book instantly</p>
                      </div>
                      <ChevronRight className="ml-auto text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="xl:order-1 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Upcoming Booking</p>
                  <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Electrician</h2>
                  <p className="mt-3 text-sm text-slate-600">Today • 3:00 PM</p>
                </div>
                <span className="inline-flex items-center rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Live</span>
              </div>

              <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-[#f8f7f4] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Professional</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">Arun Kumar</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    <Star size={16} className="text-amber-500" /> 4.9
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Status: On the Way</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">₹399</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">Track</button>
                <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Chat</button>
              </div>
            </article>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">My Bookings</p>
                <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Track everything in one place</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {activityTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab.key ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {bookings
                .filter((booking) => {
                  if (activeTab === "upcoming") return booking.status !== "Completed" && booking.status !== "Cancelled";
                  if (activeTab === "in-progress") return booking.status === "On the Way";
                  if (activeTab === "completed") return booking.status === "Completed";
                  if (activeTab === "cancelled") return booking.status === "Cancelled";
                  return true;
                })
                .map((booking) => (
                  <div key={booking.id} className="rounded-[24px] border border-slate-200 bg-[#faf9f7] p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">{booking.service}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-950">{booking.time}</h3>
                        <p className="mt-2 text-sm text-slate-600">Professional: {booking.proName}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold ${booking.statusColor}`}>{booking.status}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">Track</button>
                      <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Chat</button>
                      <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition">Cancel</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
