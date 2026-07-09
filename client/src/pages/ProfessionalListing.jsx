import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Star, MapPin, Clock, ArrowRight, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock professionals data for the listing
const professionalsList = [
  { 
    id: "p1", 
    name: "Arun Kumar", 
    role: "Expert Plumber", 
    category: "Plumbing",
    rating: 4.9, 
    reviews: 320, 
    experience: "10+ years", 
    price: 299, 
    distance: "2.5 km away", 
    availability: "Available Today",
    image: "https://ui-avatars.com/api/?name=Arun+Kumar&background=047857&color=fff&size=256",
    skills: ["Pipe Fitting", "Leak Repair", "Bathroom Renovation"]
  },
  { 
    id: "p2", 
    name: "Jose Varghese", 
    role: "Master Electrician", 
    category: "Electrical",
    rating: 4.8, 
    reviews: 280, 
    experience: "8+ years", 
    price: 249, 
    distance: "1.2 km away", 
    availability: "Available Tomorrow",
    image: "https://ui-avatars.com/api/?name=Jose+Varghese&background=0284c7&color=fff&size=256",
    skills: ["Wiring", "Appliance Installation", "Panel Upgrade"]
  },
  { 
    id: "p5", 
    name: "Ravi Shankar", 
    role: "Plumbing Specialist", 
    category: "Plumbing",
    rating: 4.6, 
    reviews: 150, 
    experience: "4+ years", 
    price: 199, 
    distance: "5.0 km away", 
    availability: "Available Tomorrow",
    image: "https://ui-avatars.com/api/?name=Ravi+Shankar&background=047857&color=fff&size=256",
    skills: ["Drain Cleaning", "Tap Repair", "Water Tank Cleaning"]
  },
];

export default function ProfessionalListing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category") || "All";
  
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("Recommended");
  const [showSort, setShowSort] = useState(false);

  const categories = ["All", "Plumbing", "Electrical"];
  const sortOptions = ["Recommended", "Rating: High to Low", "Price: Low to High", "Distance: Nearest"];

  const handleBookNow = (proId) => {
    if (!user) {
      navigate("/login", { state: { returnTo: `/book/${proId}` } });
    } else {
      navigate(`/book/${proId}`);
    }
  };

  const filteredPros = professionalsList
    .filter(pro => activeCategory === "All" || pro.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "Rating: High to Low") return b.rating - a.rating;
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Distance: Nearest") return parseFloat(a.distance) - parseFloat(b.distance);
      return 0; // Recommended
    });

  return (
    <main className="bg-slate-50 pt-28 pb-20 sm:pt-32 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
              {activeCategory === "All" ? "All Professionals" : `${activeCategory} Professionals`}
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Find and book trusted experts near you.
            </p>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Filter size={16} />
                Sort: {sortBy}
                <ChevronDown size={16} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-20">
                  {sortOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => { setSortBy(option); setShowSort(false); }}
                      className={`block w-full rounded-xl px-4 py-2 text-left text-sm transition ${sortBy === option ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-10 flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Professional Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPros.map((pro) => (
            <div key={pro.id} className="flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm">
                    <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
                    <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-green-500"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-1">
                      {pro.name} <CheckCircle2 size={16} className="text-blue-500" />
                    </h3>
                    <p className="text-sm font-medium text-emerald-700">{pro.role}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-900"><Star size={16} className="fill-amber-400 text-amber-400" /> {pro.rating}</span>
                      <span>({pro.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin size={16} className="text-slate-400" />
                    {pro.distance}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock size={16} className="text-slate-400" />
                    {pro.experience}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {pro.skills.map((skill, idx) => (
                    <span key={idx} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Starting at</p>
                    <p className="text-2xl font-bold text-slate-900">₹{pro.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-700">{pro.availability}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link 
                    to={`/professional/${pro.id}`}
                    className="flex flex-1 items-center justify-center rounded-2xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    View Profile
                  </Link>
                  <button 
                    onClick={() => handleBookNow(pro.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800 hover:shadow-lg"
                  >
                    Book Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPros.length === 0 && (
            <div className="col-span-full rounded-[32px] border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-xl font-bold text-slate-900">No professionals found</p>
              <p className="mt-2 text-slate-500">Try selecting a different category or adjusting your filters.</p>
              <button 
                onClick={() => setActiveCategory("All")}
                className="mt-6 rounded-full bg-emerald-100 px-6 py-2 font-semibold text-emerald-700 hover:bg-emerald-200"
              >
                View all professionals
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
