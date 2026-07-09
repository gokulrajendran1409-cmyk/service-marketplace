import { ArrowRight, MapPin, Star, Wrench, Sparkles, Droplet, Bolt, Snowflake, Car } from "lucide-react";
import { Link } from "react-router-dom";

const problems = [
  { title: "Water Leak", subtitle: "Fix leaks & drips", icon: Droplet, color: "bg-blue-100 text-blue-700" },
  { title: "Power Failure", subtitle: "Electrical issues", icon: Bolt, color: "bg-yellow-100 text-yellow-700" },
  { title: "AC Not Cooling", subtitle: "AC repair & service", icon: Snowflake, color: "bg-sky-100 text-sky-700" },
  { title: "Car Problem", subtitle: "Repair & diagnostics", icon: Car, color: "bg-rose-100 text-rose-700" },
  { title: "Need Cleaning", subtitle: "Home or office", icon: Sparkles, color: "bg-emerald-100 text-emerald-700" },
  { title: "More Problems", subtitle: "Explore all", icon: Wrench, color: "bg-violet-100 text-violet-700" },
];

const serviceCards = [
  { title: "Electrical", description: "Wiring, lights, switches", price: "Starting at ₹249", iconColor: "text-amber-700 bg-amber-100", image: "/images/electrical.png" },
  { title: "Painting", description: "Home, office, walls", price: "Starting at ₹199", iconColor: "text-rose-700 bg-rose-100", image: "/images/painting.png" },
  { title: "Cleaning", description: "Home, office, deep clean", price: "Starting at ₹249", iconColor: "text-emerald-700 bg-emerald-100", image: "/images/cleaning.png" },
  { title: "AC Repair", description: "Installation, service", price: "Starting at ₹249", iconColor: "text-sky-700 bg-sky-100", image: "/images/ac_repair.png" },
];

const professionals = [
  { name: "Arun Plumber", role: "Plumbing Specialist", rating: "4.9", reviews: "320", jobs: "1.2k jobs", experience: "10+ years", color: "bg-emerald-50" },
  { name: "Jose Electrician", role: "Electrical Expert", rating: "4.8", reviews: "280", jobs: "960 jobs", experience: "8+ years", color: "bg-amber-50" },
  { name: "Navas AC Technician", role: "AC Repair Specialist", rating: "4.9", reviews: "250", jobs: "700 jobs", experience: "7+ years", color: "bg-sky-50" },
  { name: "Sumeesh Painter", role: "Painting Specialist", rating: "4.7", reviews: "200", jobs: "600 jobs", experience: "5+ years", color: "bg-rose-50" },
];

const reviews = [
  { text: "The plumber arrived on time and fixed the leak quickly. Very professional and polite.", name: "Arun Kumar", location: "Kochi" },
  { text: "Great service! My AC was not cooling and the technician fixed it in just 20 minutes.", name: "Meera Nair", location: "Kochi" },
];

export default function HomeSections() {
  return (
    <main className="space-y-16 bg-slate-50 pt-28 sm:pt-32">
      <section className="relative overflow-hidden bg-emerald-50 pb-24 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-7 min-w-0">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-200/80">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white">✓</span>
                Trusted by 25,000+ customers across Kerala
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
                  What needs <span className="text-emerald-700">fixing today?</span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Book trusted professionals for your home, business, and everyday needs in minutes.
                </p>
              </div>

              <div className="rounded-[36px] bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-[1.7fr_0.9fr_auto] md:items-center">
                  <div className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-inner shadow-slate-100">
                    <input className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search any problem or service..." />
                  </div>
                  <div className="min-w-0 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <MapPin size={18} className="text-emerald-700" />
                    <span className="text-sm font-medium text-slate-700">Kochi, Kerala</span>
                  </div>
                  <button className="inline-flex h-full min-h-[56px] items-center justify-center rounded-3xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800">
                    <ArrowRight size={18} />
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>Popular right now:</span>
                  {['Plumber', 'Electrician', 'AC Repair', 'Cleaning', 'Painting'].map((item) => (
                    <button key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition hover:bg-emerald-700 hover:text-white">
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl bg-white p-6 text-center shadow-sm shadow-slate-200/80">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Available in</p>
                  <p className="mt-4 text-3xl font-bold text-emerald-700">30 mins</p>
                  <p className="text-sm text-slate-500">in your area</p>
                </div>
                <div className="rounded-3xl bg-white p-6 text-center shadow-sm shadow-slate-200/80">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Rating</p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">4.8 <Star className="inline text-amber-400" /></p>
                  <p className="text-sm text-slate-500">(2.3k reviews)</p>
                </div>
                <div className="rounded-3xl bg-white p-6 text-center shadow-sm shadow-slate-200/80">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Professionals nearby</p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">120+</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto max-w-xl">
              <div className="overflow-hidden rounded-[40px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
                <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200" alt="Professional Service" className="h-[520px] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700">Need help with something?</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">Choose a common problem and we'll handle the rest.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <button key={problem.title} className="group rounded-[30px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">
                  <div className={`${problem.color} inline-flex h-14 w-14 items-center justify-center rounded-3xl`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{problem.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{problem.subtitle}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    Explore <ArrowRight size={16} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
          <div className="self-start rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] xl:sticky xl:top-32">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Popular Services</p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight lg:text-3xl">Top-rated services to keep your home running smoothly.</h2>
            <button className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-emerald-700 px-5 py-3 text-sm font-semibold transition hover:bg-emerald-800">
              View all services
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[36px] bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
              <div className="mb-5 inline-flex rounded-3xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Best Rated</div>
              <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100">
                <img src="/images/plumbing.png" alt="Plumbing" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              </div>
              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">Plumbing</p>
                  <p className="mt-1 text-sm text-slate-500">Pipes, taps, bathroom, drainage</p>
                </div>
              </div>
              <p className="mt-6 text-sm font-semibold text-slate-900">Starting at ₹299</p>
            </div>
            {serviceCards.map((card) => (
              <div key={card.title} className="group flex flex-col rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="aspect-[4/3] mb-6 overflow-hidden rounded-[28px] bg-slate-100">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl ${card.iconColor}`}>
                      <Bolt size={20} className={card.iconColor.includes("text-amber") ? "text-amber-700" : card.iconColor.includes("text-rose") ? "text-rose-700" : card.iconColor.includes("text-emerald") ? "text-emerald-700" : "text-sky-700"} />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-slate-900">{card.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6">
                    <p className="text-sm font-semibold text-slate-900">{card.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="rounded-[32px] bg-white p-6 text-center shadow-sm shadow-slate-200/80">
            <p className="font-semibold text-slate-900">Verified Experts</p>
            <p className="mt-3 text-sm text-slate-600">All professionals are background checked and verified.</p>
          </div>
          <div className="rounded-[32px] bg-white p-6 text-center shadow-sm shadow-slate-200/80">
            <p className="font-semibold text-slate-900">Secure Payments</p>
            <p className="mt-3 text-sm text-slate-600">Payment released only after job completion.</p>
          </div>
          <div className="rounded-[32px] bg-white p-6 text-center shadow-sm shadow-slate-200/80">
            <p className="font-semibold text-slate-900">AI Recommendations</p>
            <p className="mt-3 text-sm text-slate-600">We match you with the best professional for your needs.</p>
          </div>
          <div className="rounded-[32px] bg-white p-6 text-center shadow-sm shadow-slate-200/80">
            <p className="font-semibold text-slate-900">24/7 Support</p>
            <p className="mt-3 text-sm text-slate-600">Emergency support whenever you need us.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Become a Pro</p>
              <h2 className="text-3xl font-extrabold">Grow your business with Worksy</h2>
              <p className="text-sm text-slate-300">Join thousands of professionals and get more jobs in your area.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-3xl font-bold text-white">25K+</p>
              <p className="text-sm text-slate-300">Active Customers</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-3xl font-bold text-white">45K+</p>
              <p className="text-sm text-slate-300">Jobs Posted</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-3xl font-bold text-white">₹15L+</p>
              <p className="text-sm text-slate-300">Earned by Pros</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[36px] bg-white p-8 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xl font-bold text-slate-900">Top rated professionals</p>
              <Link to="/professional/dashboard" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">View all professionals <ArrowRight size={18} /></Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {professionals.map((pro) => (
                <div key={pro.name} className={`${pro.color} rounded-[32px] p-6 shadow-sm`}> 
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-3xl bg-white/80" />
                    <div>
                      <p className="font-semibold text-slate-950">{pro.name}</p>
                      <p className="text-sm text-slate-700">{pro.role}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm text-slate-700">
                    <span>⭐ {pro.rating} ({pro.reviews})</span>
                    <span>{pro.jobs}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{pro.experience}</p>
                  <button className="mt-6 w-full rounded-3xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">Book Now</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-8 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-slate-900">What our customers say</p>
              <Link to="/" className="text-sm font-semibold text-emerald-700">View all reviews</Link>
            </div>
            <div className="mt-6 space-y-6">
              {reviews.map((review) => (
                <div key={review.name} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-slate-700">"{review.text}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <p className="text-sm text-slate-500">{review.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
