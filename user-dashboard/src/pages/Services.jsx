import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ChevronRight, Clock3,
  LocateFixed, MapPin, Search, ShieldCheck, Sparkles, Star, SlidersHorizontal,
  Shield, Zap, Calendar, Check, Filter, Layers
} from 'lucide-react';
import { API } from '../constants';
import { getServiceImage, getServiceCover, getIncludedServices, getPriceRange } from '../assets/serviceImages';
import { BookingModal } from '../components/BookingModal';
import rajesh from '../assets/experts/rajesh.png';

const PRIMARY = '#2E7D32';

const FALLBACK_SERVICES = [
  { id: 'plumbing', name: 'Plumbing', description: 'Fix leaks, install pipes, complete plumbing solutions' },
  { id: 'electrical', name: 'Electrician', description: 'Safe wiring, repairs and electrical installations' },
  { id: 'ac-appliance', name: 'AC & Appliance Repair', description: 'AC service, washing machine & fridge repair' },
  { id: 'carpentry', name: 'Carpentry', description: 'Furniture repair, custom work and woodwork' },
  { id: 'painting', name: 'Painting', description: 'Interior, exterior walls and wood painting' },
  { id: 'cleaning', name: 'House Cleaning', description: 'Deep cleaning, sanitization, regular housekeeping' },
  { id: 'home-repair', name: 'Home Repair & Maintenance', description: 'All-round handyman for quick home fixes' },
  { id: 'cctv', name: 'CCTV & Security', description: 'Camera installation and complete security setup' },
  { id: 'vehicle', name: 'Vehicle Recovery', description: 'Tow van service & roadside assistance 24/7' },
  { id: 'gardening', name: 'Gardening & Landscaping', description: 'Lawn care, plants and outdoor design' },
  { id: 'computer', name: 'Computer & Mobile Repair', description: 'Laptop, phone and gadget fixes at home' },
  { id: 'photo', name: 'Photography & Videography', description: 'Professional events, functions and shoots' },
];
const rate = (pro) => Number(pro.wage) || 399;

/* ---------- Skeleton Shimmer Loader ---------- */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden animate-pulse">
      <div className="flex gap-4">
        <div className="w-[72px] h-[72px] rounded-2xl bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 py-1">
          <div className="h-4 w-3/5 bg-gray-100 rounded-md" />
          <div className="h-3 w-2/5 bg-gray-100 rounded-md" />
          <div className="h-3 w-4/5 bg-gray-100 rounded-md mt-1" />
          <div className="h-3 w-2/4 bg-gray-100 rounded-md" />
        </div>
      </div>
      <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-14 bg-gray-100 rounded-md" />
          <div className="h-5 w-16 bg-gray-100 rounded-md" />
        </div>
        <div className="h-9 w-24 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

/* ---------- ProviderCard (new premium layout) ---------- */
function ProviderCard({ expert, index, onBook, category }) {
  const avatar = expert.profile_photo || (index === 0 ? rajesh : null);
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.995]">
      <div className="p-4">
        <div className="flex gap-3.5">
          <div className="relative shrink-0">
            <div className="w-[76px] h-[76px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
              {avatar ? (
                <img src={avatar} alt={expert.full_name} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[26px] font-black text-white bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]">
                  {expert.full_name?.[0] || 'S'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <CheckCircle2 size={17} className="text-[#2E7D32]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-1.5">
              <div className="min-w-0 flex flex-col pr-2">
                <h3 className="text-[15.5px] font-extrabold text-[#111] tracking-[-0.01em] leading-tight truncate">
                  {expert.full_name || 'Verified Expert'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#1B5E20] mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Available now
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#FFF3E0] px-2.5 py-1 rounded-full border border-[#FFE0B2] shrink-0 shadow-[0_1px_3px_rgba(255,111,0,0.08)]">
                <Star size={10} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} />
                <span className="text-[11px] font-black text-[#FF6F00] tracking-tight">{expert.rating || 4.9}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className="bg-[#2E7D32] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_2px_6px_rgba(46,125,50,0.22)]">
                {category || expert.category || 'Expert'}
              </span>
              <span className="text-[10.5px] font-semibold text-gray-500 flex items-center gap-1">
                <MessageCircleHeartSvg /> 128 reviews
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={12} strokeWidth={2.5} className="text-[#2E7D32]" /> Kochi, Kerala
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-600 bg-gray-50 rounded-xl px-2.5 py-2 justify-center">
            <Clock3 size={12} strokeWidth={2.5} className="text-[#2E7D32]" />
            <span>{expert.experience_years || 12}+ yrs exp.</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-600 bg-[#F0FDF4] rounded-xl px-2.5 py-2 justify-center border border-[#C8E6C9]/50">
            <BadgeCheck size={12} strokeWidth={2.5} className="text-[#2E7D32]" />
            Licensed
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#9A3412] bg-[#FFF7ED] rounded-xl px-2.5 py-2 justify-center border border-[#FFE0B2]/60">
            <Calendar size={12} strokeWidth={2.5} className="text-[#FF6F00]" />
            Today slots
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center px-4 pb-4">
        <div className="flex flex-col">
          <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Visit Fee</span>
          <span className="text-[17px] font-black text-[#111] tracking-[-0.015em]">
            ₹{rate(expert)}<span className="text-[11.5px] font-semibold text-gray-500 ml-1">/visit</span>
          </span>
        </div>
        <button
          onClick={onBook}
          className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white px-6 py-3 rounded-2xl text-[12.5px] font-extrabold flex items-center gap-1.5 shadow-[0_6px_18px_rgba(46,125,50,0.35)] active:scale-95 transition-transform"
        >
          Book Now <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
}

function MessageCircleHeartSvg() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF6F00" stroke="#FF6F00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ---------- Big category tile (2-col grid) ---------- */
function CategoryTile({ service, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 text-left shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white transition-all active:scale-[0.98] hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]"
    >
      <img
        src={getServiceImage(service.name)}
        alt={service.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-active:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F0A]/95 via-[#0A1F0A]/40 to-transparent" />
      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/60 transition-all group-active:bg-[#2E7D32]">
        <ChevronRight size={14} strokeWidth={2.5} className="text-[#1B5E20] transition-all group-active:text-white" />
      </div>
      <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/85 backdrop-blur-sm shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-white/60">
        <span className="text-[9.5px] font-black text-[#1B5E20] uppercase tracking-wider leading-none">Seva</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col gap-1">
        <h3 className="text-[14.5px] font-black text-white tracking-[-0.01em] leading-tight drop-shadow-sm">
          {service.name}
        </h3>
        <p className="text-[11px] font-semibold text-white/80 leading-snug line-clamp-2 mb-1">
          {service.description || 'Book verified expert near you'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-0.5 bg-[#FFF3E0] px-1.5 py-0.5 rounded-full border border-[#FFE0B2]">
            <Star size={8} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} />
            <span className="text-[9.5px] font-black text-[#FF6F00] leading-none">4.8</span>
          </div>
          <span className="text-[10px] font-semibold text-white/80 leading-none">Verified experts</span>
        </div>
      </div>
    </button>
  );
}

/* ---------- Main Page ---------- */
export default function Services({ navigate, initialGroup: _initialGroup, initialCategory }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expertLoading, setExpertLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [search, setSearch] = useState('');
  // Track if user has ever seen the All Services list view — if arrived via deep-link,
  // back from experts should still land on the list first, then home.
  const [seenListView, setSeenListView] = useState(false);

  const visible = useMemo(
    () => categories.filter(item =>
      !search || item.name.toLowerCase().includes(search.toLowerCase())
    ),
    [categories, search]
  );

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(Array.isArray(data) && data.length ? data : FALLBACK_SERVICES))
      .catch(() => setCategories(FALLBACK_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const choose = async (category) => {
    setSeenListView(true); // they came from the list (or we simulate they saw it)
    setSelected(category);
    setExpertLoading(true);
    setExperts([]);
    try {
      const response = await fetch(`${API}/professionals?${new URLSearchParams({ category: category.name })}`);
      const data = await response.json();
      setExperts(Array.isArray(data) ? data : []);
    } catch {
      setExperts([]);
    } finally {
      setExpertLoading(false);
    }
  };

  // Deep-link from Home: auto-pick matching category, still mark list "seen" so back flow works.
  useEffect(() => {
    if (!initialCategory || !categories.length || selected) return;
    const target = categories.find(item =>
      item.name === initialCategory ||
      item.name.toLowerCase().includes(initialCategory.toLowerCase()) ||
      initialCategory.toLowerCase().includes(item.name.toLowerCase())
    );
    if (target) {
      choose(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategory, categories, selected]);

  const complete = () => {
    setBooking(null);
    navigate('requests');
  };

  const goBack = () => {
    if (selected) {
      // First back → deselect to All Services list.
      setSeenListView(true);
      setSelected(null);
      setExperts([]);
      setExpertLoading(false);
    } else {
      // If list shown already or user arrived here via "All Services" button → home.
      navigate('home');
    }
  };

  /* ==================== EXPERTS VIEW ==================== */
  if (selected) {
    const [priceMin, priceMax] = getPriceRange(selected.name);
    const included = getIncludedServices(selected.name);

    return (
      <div className="min-h-screen bg-gray-50 pb-[120px] font-['Inter',sans-serif] text-[#111]">
        {/* ===== CATEGORY COVER BANNER ===== */}
        <div className="relative w-full h-[220px] overflow-hidden bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]">
          <img
            src={getServiceCover(selected.name)}
            alt={selected.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-overlay"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1B5E20]/55 to-[#0A3D0A]/95" />

          {/* floating header over banner */}
          <header className="sticky top-0 z-30 relative h-[76px] px-5 flex items-center justify-between">
            <button
              onClick={goBack}
              className="w-[44px] h-[44px] rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
            >
              <ArrowLeft size={19} strokeWidth={2.5} />
            </button>
            <h1 className="text-[15.5px] font-extrabold text-white tracking-[-0.01em] truncate px-2 drop-shadow-sm max-w-[60%] text-center">
              {selected.name}
            </h1>
            <button className="w-[44px] h-[44px] rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
              <SlidersHorizontal size={17} strokeWidth={2.5} />
            </button>
          </header>

          {/* banner info */}
          <div className="absolute left-5 right-5 bottom-4 flex items-end justify-between gap-3 z-10">
            <div className="flex items-end gap-3 min-w-0">
              <div className="w-[66px] h-[66px] rounded-2xl overflow-hidden bg-white shadow-[0_6px_18px_rgba(0,0,0,0.28)] border-2 border-white shrink-0">
                <img src={getServiceImage(selected.name)} alt={selected.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col pb-1 min-w-0">
                <h2 className="text-[19px] font-black text-white tracking-[-0.015em] leading-tight truncate">
                  {selected.name}
                </h2>
                <p className="text-[11.5px] font-semibold text-white/85 leading-snug truncate max-w-[200px]">
                  {selected.description || 'Verified experts near you'}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex items-center gap-0.5 bg-[#FFF3E0] px-1.5 py-0.5 rounded-full border border-[#FFE0B2] shadow-sm">
                    <Star size={9} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} />
                    <span className="text-[9.5px] font-black text-[#FF6F00] leading-none">4.8 · {experts.length || 0}+ pro</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-white/90 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    <Shield size={8.5} className="text-[#1B5E20]" strokeWidth={2.5} />
                    <span className="text-[9.5px] font-black text-[#1B5E20] leading-none">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end pb-1 shrink-0">
              <span className="text-[9.5px] font-bold text-white/75 uppercase tracking-widest leading-none">Price</span>
              <span className="text-[15px] font-black text-white tracking-[-0.01em] mt-0.5">{priceMin} - {priceMax}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 -mt-1 relative z-10">
          {/* ===== INCLUDED SERVICES CHIPS ===== */}
          <div className="mb-5">
            <h3 className="text-[12px] font-bold text-gray-500 mb-2.5 tracking-wide">WHAT'S INCLUDED</h3>
            <div className="flex flex-wrap gap-1.5">
              {included.map((inc, i) => (
                <span
                  key={inc + i}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[#C8E6C9]/60 text-[11px] font-bold text-[#1B5E20] shadow-[0_1px_3px_rgba(46,125,50,0.05)]"
                >
                  <Check size={11} strokeWidth={3} className="text-[#2E7D32]" /> {inc}
                </span>
              ))}
            </div>
          </div>

          {/* ===== AUTO-ASSIGN HERO CTA ===== */}
          <button
            onClick={() => setBooking({ professional: null, category: selected.name })}
            className="w-full relative overflow-hidden rounded-3xl p-4 mb-6 flex items-center gap-3.5 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#2E7D32] text-white shadow-[0_10px_30px_rgba(46,125,50,0.38)] active:scale-[0.995] transition-transform"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/8" />
            <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/18 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/25">
              <Zap size={22} strokeWidth={2} fill="currentColor" />
            </div>
            <div className="relative z-10 flex-1 text-left min-w-0">
              <p className="text-[15px] font-black tracking-[-0.01em] leading-tight">⚡ Auto-Assign Expert</p>
              <p className="text-[11.5px] text-white/85 mt-0.5 font-medium leading-snug">
                We pick the nearest & best available {selected.name} expert.
              </p>
            </div>
            <div className="relative z-10 w-11 h-11 rounded-2xl bg-white text-[#1B5E20] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.20)]">
              <ArrowRight size={17} strokeWidth={2.5} />
            </div>
          </button>

          {/* ===== SEARCH + FILTER ===== */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-gray-100 flex-1">
              <Search size={16} strokeWidth={2.5} className="text-gray-400 shrink-0" />
              <input
                placeholder="Search expert name or area..."
                className="bg-transparent border-none outline-none text-[13.5px] font-semibold w-full text-[#111] placeholder-gray-400 min-w-0"
              />
            </div>
            <button className="w-[46px] h-[46px] rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-[0_1px_4px_rgba(0,0,0,0.04)] active:scale-95 transition-transform shrink-0">
              <Filter size={17} strokeWidth={2.5} />
            </button>
          </div>

          {/* ===== FILTER PILLS + HEADER ===== */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-[13px] font-extrabold text-gray-500">
              {expertLoading
                ? 'Matching experts near you…'
                : experts.length
                  ? `${experts.length} ${selected.name} Experts near you`
                  : 'Nearby Experts'}
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              <button className="bg-[#2E7D32] text-white px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 shadow-[0_2px_8px_rgba(46,125,50,0.3)] inline-flex items-center gap-1">
                <LocateFixed size={10} strokeWidth={3} /> Nearby
              </button>
              <button className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 inline-flex items-center gap-1">
                <Star size={10} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} /> Top Rated
              </button>
              <button className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 inline-flex items-center gap-1">
                <Layers size={10} strokeWidth={3} /> Price
              </button>
            </div>
          </div>

          {/* ===== LOADING / EMPTY / LIST ===== */}
          {expertLoading ? (
            <div className="flex flex-col gap-3.5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : experts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F0FDF4] to-[#E8F5E9] border border-[#C8E6C9]/70 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Search size={30} strokeWidth={2.5} className="text-[#2E7D32]" />
              </div>
              <p className="text-[16px] font-black text-[#111] mb-1 tracking-[-0.01em]">No experts found nearby</p>
              <p className="text-[12.5px] font-semibold text-gray-500 mb-5 leading-snug">
                Try auto-assign — we notify all available {selected.name} pros instantly.
              </p>
              <button
                onClick={() => setBooking({ professional: null, category: selected.name })}
                className="bg-gradient-to-r from-[#FF6F00] to-[#FB923C] text-white px-6 py-3 rounded-2xl text-[12.5px] font-extrabold active:scale-95 transition-transform shadow-[0_6px_18px_rgba(255,111,0,0.40)] inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} strokeWidth={2.5} /> Auto-Assign Expert
              </button>
            </div>
          ) : (
            <section className="flex flex-col gap-3.5">
              {experts.map((expert, i) => (
                <ProviderCard
                  key={expert.id || i}
                  expert={expert}
                  index={i}
                  category={selected.name}
                  onBook={() => setBooking({ professional: expert, category: selected.name })}
                />
              ))}
            </section>
          )}

          {/* ===== SATISFACTION GUARANTEE ===== */}
          <aside className="bg-gradient-to-br from-[#F0FDF4] to-white border border-[#C8E6C9]/70 p-4.5 rounded-3xl flex gap-3.5 mt-6 items-start shadow-[0_2px_10px_rgba(46,125,50,0.06)]">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-[#C8E6C9]/70 shadow-sm">
              <ShieldCheck size={20} className="text-[#2E7D32]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col flex-1">
              <b className="text-[13.5px] text-[#1B5E20] tracking-[-0.01em] font-black leading-tight">100% Satisfaction Guarantee</b>
              <small className="text-[11.5px] font-semibold text-[#4A6B4A] leading-snug mt-1">
                Every Seva partner is background-verified & trained. Unsatisfied? We'll re-do the work <b>for free</b>.
              </small>
            </div>
          </aside>

          {/* ===== BROWSE MORE CTA ===== */}
          <div className="mt-6 mb-2 relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#2E7D32] text-white shadow-[0_10px_28px_rgba(27,94,32,0.30)]">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-20 -bottom-24 w-60 h-60 rounded-full bg-white/5" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/18 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/25">
                <Sparkles size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <b className="text-[14.5px] tracking-[-0.01em] block mb-1 font-black leading-tight">Need something else?</b>
                <p className="text-[11.5px] text-white/85 font-medium leading-snug mb-3.5">Browse 10+ more home services — experts for every job.</p>
                <button
                  onClick={() => { setSelected(null); setExperts([]); setExpertLoading(false); setSeenListView(true); }}
                  className="bg-white text-[#1B5E20] text-[12px] font-extrabold px-4 py-2.5 rounded-2xl active:scale-95 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.18)] inline-flex items-center gap-1"
                >
                  All Services <ArrowRight size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {booking && (
          <BookingModal
            professional={booking.professional}
            category={booking.category}
            currentLocation={null}
            onClose={() => setBooking(null)}
            onSuccess={complete}
          />
        )}
      </div>
    );
  }

  /* ==================== ALL SERVICES VIEW (2-COLUMN GRID) ==================== */
  return (
    <div className="min-h-screen bg-gray-50 pb-[120px] font-['Inter',sans-serif] text-[#111]">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 h-[76px] flex items-center justify-between border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <button
          onClick={goBack}
          className="w-[44px] h-[44px] rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100"
        >
          <ArrowLeft size={19} strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-[16.5px] text-[#111] font-black tracking-[-0.015em] leading-tight">All Services</h1>
          <span className="text-[10.5px] text-gray-500 font-semibold leading-none mt-0.5">{categories.length || 12} categories</span>
        </div>
        <span className="w-[44px]" />
      </header>

      <div className="px-5 pt-5">
        {/* ===== SEARCH ===== */}
        <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6 border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0 shadow-sm">
            <Search size={17} strokeWidth={2.5} className="text-white" />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services — plumber, electrician..."
            className="bg-transparent border-none outline-none text-[14px] font-semibold flex-1 text-[#111] placeholder-gray-400 min-w-0"
          />
        </div>

        {/* ===== TITLE ROW ===== */}
        <div className="flex justify-between items-end mb-4 pr-1">
          <div>
            <h2 className="text-[18px] font-black text-[#111] tracking-[-0.015em] leading-tight">Home Services</h2>
            <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">Tap any category to see verified experts</p>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-full border border-[#C8E6C9]/60">
            {visible.length} <Layers size={11} strokeWidth={3} />
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center mt-2">
            <p className="text-[14px] font-bold text-gray-500">No services match "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map(service => (
              <CategoryTile
                key={service.id || service.name}
                service={service}
                onClick={() => choose(service)}
              />
            ))}
          </div>
        )}

        {/* ===== BANNER: need help? ===== */}
        <button
          onClick={() => navigate('home')}
          className="mt-8 mb-4 w-full relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#2E7D32] text-white shadow-[0_10px_28px_rgba(27,94,32,0.30)] active:scale-[0.995] transition-transform text-left"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-20 -bottom-24 w-60 h-60 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white/18 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/25">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <b className="text-[14.5px] tracking-[-0.01em] block mb-1 font-black leading-tight">Not sure what you need?</b>
              <p className="text-[11.5px] text-white/85 font-medium leading-snug mb-3.5">
                Go back home & try our instant auto-assign — we match the right pro for you.
              </p>
              <span className="bg-white text-[#1B5E20] text-[12px] font-extrabold px-4 py-2.5 rounded-2xl inline-flex items-center gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
                Back to Home <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
