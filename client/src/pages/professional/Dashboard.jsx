import {
  Bell,
  CalendarDays,
  ChevronDown,
  Circle,
  Clock3,
  CreditCard,
  Folder,
  Home,
  LogOut,
  MapPin,
  Settings,
  Star,
  TrendingUp,
  User,
  Wallet,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sidebarItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Bookings", icon: CalendarDays },
  { label: "Earnings", icon: Wallet },
  { label: "Reviews", icon: Star },
  { label: "Portfolio", icon: Folder },
  { label: "Availability", icon: Clock3 },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
  { label: "Logout", icon: LogOut },
];

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const name = user?.full_name?.split(" ")[0] || "Professional";

  return (
    <main className="min-h-screen bg-[#f8f5ef] pt-28 text-slate-900">
      <div className="mx-auto grid max-w-[1550px] gap-6 px-4 py-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-6 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_68px_-32px_rgba(15,23,42,0.2)]">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Servora</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">Pro Workspace</h2>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 shadow-sm">
              <Home size={20} />
            </div>
          </div>

          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                    item.active
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 rounded-[26px] border border-slate-200 bg-emerald-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Need help?</p>
            <p className="mt-2 text-slate-600">Tap support for new booking issues, payout questions, or verification status.</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-slate-100">
              Contact Support <ArrowRight size={16} />
            </button>
          </div>
        </aside>

        <section className="space-y-6">
          <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.2)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Professional Dashboard</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Hello, {name} 👋</h1>
                <p className="mt-3 max-w-2xl text-slate-600">Your next jobs, earnings, and requests are waiting. Keep your business moving.</p>
              </div>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-end">
                <button className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  <Bell size={18} /> Notifications
                </button>
                <button className="inline-flex items-center gap-3 rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800">
                  <span className="h-9 w-9 rounded-full bg-emerald-700 text-white grid place-items-center">{name.charAt(0)}</span>
                  <span>{name}</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 md:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Earnings</p>
              <p className="mt-4 text-3xl font-bold text-slate-950">₹18,450</p>
              <p className="mt-2 text-sm text-slate-500">This week</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Jobs Today</p>
              <p className="mt-4 text-3xl font-bold text-slate-950">5</p>
              <p className="mt-2 text-sm text-slate-500">Confirmed bookings</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Rating</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-950">4.9</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">From 126 reviews</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Pending Requests</p>
              <p className="mt-4 text-3xl font-bold text-slate-950">3</p>
              <p className="mt-2 text-sm text-slate-500">New booking requests</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Today's Bookings</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Focus on the next job</h2>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700">
                  View all bookings
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    time: "09:00 AM",
                    service: "Fan Repair",
                    customer: "John",
                    location: "Trivandrum",
                    action: "View",
                    variant: "emerald",
                  },
                  {
                    time: "11:30 AM",
                    service: "AC Service",
                    customer: "Rahul",
                    location: "Kazhakootam",
                    action: "Navigate",
                    variant: "slate",
                  },
                  {
                    time: "03:00 PM",
                    service: "Wiring Work",
                    customer: "Amal",
                    location: "Varkala",
                    action: "Start Job",
                    variant: "emerald",
                  },
                ].map((booking) => (
                  <div key={booking.time} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{booking.time}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">{booking.service}</h3>
                        <p className="mt-2 text-sm text-slate-600">{booking.customer}</p>
                      </div>
                      <button className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white ${booking.variant === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"}`}>
                        {booking.action}
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} />
                      <span>{booking.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Pending Requests</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Review & respond</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    <Circle size={10} className="text-emerald-500" /> Live
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
                  <div className="grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr] gap-4 bg-slate-100 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <span>Customer</span>
                    <span>Service</span>
                    <span>Price</span>
                    <span>Action</span>
                  </div>
                  {[
                    { customer: "Rahul", service: "Plumbing", price: "₹600" },
                    { customer: "Anu", service: "Painting", price: "₹2,500" },
                  ].map((request) => (
                    <div key={request.customer} className="grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr] items-center gap-4 border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                      <span>{request.customer}</span>
                      <span>{request.service}</span>
                      <span>{request.price}</span>
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Accept</button>
                        <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Earnings</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Monthly performance</h2>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                    <TrendingUp size={16} /> View report
                  </button>
                </div>
                <div className="mt-6 h-56 rounded-[28px] bg-slate-50 p-6 text-slate-500 shadow-inner shadow-slate-200/80">
                  <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                    <span>April</span>
                    <span>+12.4%</span>
                  </div>
                  <div className="relative h-full rounded-3xl bg-gradient-to-b from-emerald-100 to-transparent p-4">
                    <div className="absolute left-4 bottom-6 h-4 w-4 rounded-full bg-emerald-600"></div>
                    <div className="absolute left-24 bottom-16 h-6 w-6 rounded-full bg-emerald-600"></div>
                    <div className="absolute left-44 bottom-24 h-5 w-5 rounded-full bg-emerald-600"></div>
                    <div className="absolute left-64 bottom-32 h-6 w-6 rounded-full bg-emerald-600"></div>
                    <div className="absolute left-84 bottom-12 h-4 w-4 rounded-full bg-emerald-600"></div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-200" />
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Recent Reviews</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Customer feedback</h2>

                <div className="mt-6 space-y-4">
                  {[
                    { text: "Very professional.", rating: 5 },
                    { text: "Reached on time.", rating: 5 },
                  ].map((review, index) => (
                    <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 text-amber-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={16} />
                        ))}
                      </div>
                      <p className="mt-3 text-slate-700">“{review.text}”</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
