import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, MapPin, Clock, ShieldCheck, Award, Briefcase, 
  ThumbsUp, Calendar, ChevronRight, MessageSquare, CheckCircle2 
} from "lucide-react";

// Mock specific professional data
const proData = {
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
  coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200",
  about: "I am a certified master plumber with over 10 years of experience serving the Kochi area. I specialize in residential plumbing, including leak detection, pipe fitting, bathroom renovations, and emergency repairs. My goal is to provide fast, reliable, and transparent service.",
  skills: ["Pipe Fitting", "Leak Repair", "Bathroom Renovation", "Water Heater Repair", "Drain Cleaning"],
  certifications: ["Kerala State Licensed Plumber", "Advanced Pipe Fitting Certificate"],
  serviceAreas: ["Kochi", "Ernakulam", "Kakkanad", "Edappally"],
  languages: ["English", "Malayalam"],
  portfolio: [
    "/images/plumbing.png",
    "https://images.unsplash.com/photo-1607472586893-edb57cbceb42?w=400",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400"
  ],
  reviewsList: [
    { id: 1, author: "Rahul M.", rating: 5, date: "2 days ago", comment: "Arun was fantastic! Arrived on time, fixed the leak under my sink in 20 minutes, and left everything clean." },
    { id: 2, author: "Sneha P.", rating: 5, date: "1 week ago", comment: "Very professional. Explained what was wrong with our water heater and fixed it quickly. Highly recommend." },
    { id: 3, author: "David T.", rating: 4, date: "2 weeks ago", comment: "Good service, slightly expensive but the quality of work makes up for it." }
  ],
  pricing: [
    { service: "General Plumbing Visit", price: "₹299" },
    { service: "Leak Detection & Repair", price: "Starting at ₹499" },
    { service: "Bathroom Fitting Install", price: "Starting at ₹899" },
    { service: "Water Heater Installation", price: "₹1,200" }
  ]
};

export default function ProfessionalProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("about");

  // In a real app, you would fetch data based on `id`
  const pro = proData; // Mocked for now

  return (
    <main className="bg-slate-50 pt-20 sm:pt-24 min-h-screen pb-24">
      {/* Cover Image */}
      <div className="h-64 w-full bg-slate-200 lg:h-80 relative">
        <img src={pro.coverImage} alt="Cover" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Main Content Area */}
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <div className="h-32 w-32 shrink-0 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden">
                  <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      {pro.category}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <ShieldCheck size={14} className="text-blue-600" /> Verified
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold text-slate-950 flex items-center gap-2">
                    {pro.name} <CheckCircle2 size={24} className="text-blue-500" />
                  </h1>
                  <p className="text-lg font-medium text-slate-600">{pro.role}</p>
                </div>
                <div className="flex flex-col gap-2 pb-2 w-full sm:w-auto">
                  <Link 
                    to={`/book/${pro.id}`}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-emerald-700 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-800 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Book Now <ChevronRight size={20} />
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-500"><Star size={16} className="text-slate-400"/> Rating</span>
                  <span className="mt-1 text-xl font-bold text-slate-900">{pro.rating} <span className="text-sm font-normal text-slate-500">({pro.reviews})</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-500"><Briefcase size={16} className="text-slate-400"/> Experience</span>
                  <span className="mt-1 text-xl font-bold text-slate-900">{pro.experience}</span>
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin size={16} className="text-slate-400"/> Distance</span>
                  <span className="mt-1 text-xl font-bold text-slate-900">{pro.distance}</span>
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-500"><ThumbsUp size={16} className="text-slate-400"/> Success Rate</span>
                  <span className="mt-1 text-xl font-bold text-slate-900">98%</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
              {['about', 'portfolio', 'reviews', 'pricing'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab ? "border-emerald-700 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[400px]">
              
              {activeTab === 'about' && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950 mb-4">About Me</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">{pro.about}</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2"><Award size={20} className="text-emerald-700"/> Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {pro.skills.map((skill, i) => (
                          <span key={i} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{skill}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2"><MapPin size={20} className="text-emerald-700"/> Service Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {pro.serviceAreas.map((area, i) => (
                          <span key={i} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">{area}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-emerald-700"/> Certifications</h3>
                    <ul className="space-y-3">
                      {pro.certifications.map((cert, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                          <CheckCircle2 size={18} className="text-blue-500" /> {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-950 mb-6">Recent Work</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pro.portfolio.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 group">
                        <img src={img} alt={`Work ${i+1}`} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-950">Customer Reviews</h2>
                    <span className="flex items-center gap-2 font-bold text-lg"><Star className="fill-amber-400 text-amber-400" /> {pro.rating}</span>
                  </div>
                  <div className="space-y-6">
                    {pro.reviewsList.map(review => (
                      <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-bold text-slate-900">{review.author}</div>
                          <div className="text-sm text-slate-500">{review.date}</div>
                        </div>
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                          ))}
                        </div>
                        <p className="text-slate-600 leading-relaxed">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-950 mb-6">Service Pricing</h2>
                  <div className="space-y-4">
                    {pro.pricing.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 p-5">
                        <span className="font-semibold text-slate-900">{item.service}</span>
                        <span className="font-bold text-emerald-700">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl bg-amber-50 p-4 flex gap-3 text-amber-800">
                    <Clock size={20} className="shrink-0" />
                    <p className="text-sm font-medium">Final prices may vary based on the exact scope of work and materials required. The professional will provide a final quote before starting the job.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="sticky top-32 rounded-[32px] bg-slate-950 p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-2">Ready to book?</h3>
              <p className="text-slate-400 text-sm mb-6">Select a time slot and describe your issue to get started.</p>
              
              <div className="mb-6 rounded-2xl bg-slate-900 p-4 border border-slate-800">
                <p className="text-sm text-slate-400 mb-1">Starting Price</p>
                <p className="text-3xl font-extrabold text-white">₹{pro.price}</p>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Calendar size={16} className="text-emerald-400" /> Availability</p>
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-900/50 p-4 text-emerald-400 font-medium text-sm">
                  {pro.availability}
                </div>
              </div>

              <Link 
                to={`/book/${pro.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 font-bold text-white transition hover:bg-emerald-500"
              >
                Book This Pro <ChevronRight size={18} />
              </Link>
              
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-slate-800 bg-transparent px-6 py-4 font-bold text-white transition hover:bg-slate-900">
                <MessageSquare size={18} /> Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
