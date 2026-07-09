import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Droplet,
  Bolt,
  Snowflake,
  Car,
  Sparkles,
  Wrench,
  Paintbrush,
  Wind,
  Hammer,
  Monitor,
  GraduationCap,
  Briefcase,
  Filter,
  ChevronDown,
} from "lucide-react";

const allCategories = [
  { name: "All", icon: null },
  { name: "Plumbing", icon: Droplet, color: "text-blue-700 bg-blue-100" },
  { name: "Electrical", icon: Bolt, color: "text-amber-700 bg-amber-100" },
  { name: "Cleaning", icon: Sparkles, color: "text-emerald-700 bg-emerald-100" },
  { name: "AC Repair", icon: Snowflake, color: "text-sky-700 bg-sky-100" },
  { name: "Painting", icon: Paintbrush, color: "text-rose-700 bg-rose-100" },
  { name: "Carpentry", icon: Hammer, color: "text-orange-700 bg-orange-100" },
  { name: "Vehicle Repair", icon: Car, color: "text-red-700 bg-red-100" },
  { name: "Appliance Repair", icon: Monitor, color: "text-violet-700 bg-violet-100" },
  { name: "Tutoring", icon: GraduationCap, color: "text-indigo-700 bg-indigo-100" },
  { name: "Business", icon: Briefcase, color: "text-slate-700 bg-slate-200" },
];

const allServices = [
  { id: 1, title: "Pipe Repair & Fitting", category: "Plumbing", price: 299, rating: 4.8, reviews: 320, image: "/images/plumbing.png", description: "Fix leaking pipes, taps, and bathroom fittings.", professionals: 45 },
  { id: 2, title: "Wiring & Switch Repair", category: "Electrical", price: 249, rating: 4.7, reviews: 280, image: "/images/electrical.png", description: "Complete electrical wiring, switches, and light installation.", professionals: 38 },
  { id: 3, title: "Home Deep Cleaning", category: "Cleaning", price: 499, rating: 4.9, reviews: 410, image: "/images/cleaning.png", description: "Full home deep cleaning including kitchen, bathroom, and floors.", professionals: 52 },
  { id: 4, title: "AC Service & Repair", category: "AC Repair", price: 349, rating: 4.8, reviews: 250, image: "/images/ac_repair.png", description: "AC installation, gas refill, cleaning, and full service.", professionals: 30 },
  { id: 5, title: "Wall & Room Painting", category: "Painting", price: 199, rating: 4.6, reviews: 200, image: "/images/painting.png", description: "Interior and exterior wall painting for homes and offices.", professionals: 28 },
  { id: 6, title: "Bathroom Renovation", category: "Plumbing", price: 1499, rating: 4.9, reviews: 150, image: "/images/plumbing.png", description: "Complete bathroom renovation including tiles, fittings, and plumbing.", professionals: 20 },
  { id: 7, title: "Ceiling Fan Installation", category: "Electrical", price: 199, rating: 4.5, reviews: 190, image: "/images/electrical.png", description: "Fan installation, replacement, and speed regulator fitting.", professionals: 35 },
  { id: 8, title: "Office Cleaning", category: "Cleaning", price: 799, rating: 4.7, reviews: 120, image: "/images/cleaning.png", description: "Professional office and workspace cleaning service.", professionals: 25 },
  { id: 9, title: "AC Installation", category: "AC Repair", price: 999, rating: 4.8, reviews: 180, image: "/images/ac_repair.png", description: "Split and window AC installation with copper piping.", professionals: 22 },
  { id: 10, title: "Waterproofing", category: "Painting", price: 599, rating: 4.6, reviews: 95, image: "/images/painting.png", description: "Roof and wall waterproofing to prevent leakage and dampness.", professionals: 18 },
  { id: 11, title: "Door & Window Repair", category: "Carpentry", price: 349, rating: 4.5, reviews: 110, image: "/images/plumbing.png", description: "Repair and installation of wooden doors, windows, and frames.", professionals: 15 },
  { id: 12, title: "Bike Service", category: "Vehicle Repair", price: 399, rating: 4.7, reviews: 230, image: "/images/electrical.png", description: "Full bike service including oil change, brakes, and chain.", professionals: 32 },
];

const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredServices = allServices
    .filter((s) => {
      const matchesCategory = activeCategory === "All" || s.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Rating") return b.rating - a.rating;
      if (sortBy === "Most Reviews") return b.reviews - a.reviews;
      return 0;
    });

  return (
    <main className="bg-slate-50 pt-28 pb-20 sm:pt-32">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 pb-10 pt-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Browse & Book</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Find the right <span className="text-emerald-700">service</span> for you
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Explore trusted professionals across all categories. Compare ratings, prices, and reviews.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-lg shadow-slate-200/60">
              <Search size={20} className="shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, categories, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-4 text-sm text-slate-600">
                <MapPin size={16} className="text-emerald-700" />
                <span className="font-medium">Kochi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories + Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-3">
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.name;
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {Icon && <Icon size={16} />}
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Sort & Results Count */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredServices.length}</span> services
            {activeCategory !== "All" && (
              <span> in <span className="font-semibold text-emerald-700">{activeCategory}</span></span>
            )}
          </p>

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Filter size={14} />
              {sortBy}
              <ChevronDown size={14} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSortBy(option); setShowSortDropdown(false); }}
                    className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
                      sortBy === option
                        ? "bg-emerald-50 font-semibold text-emerald-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{service.rating}</span>
                    <span className="text-slate-400">({service.reviews})</span>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{service.description}</p>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <div>
                    <p className="text-xs text-slate-400">Starting at</p>
                    <p className="text-xl font-extrabold text-slate-900">₹{service.price}</p>
                  </div>
                  <Link
                    to="/book-service"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    Book Now
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  {service.professionals} professionals available near you
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="mt-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">No services found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or browse a different category.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-6 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
