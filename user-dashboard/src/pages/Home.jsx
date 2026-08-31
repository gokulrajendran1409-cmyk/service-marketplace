import React from 'react';
import {
  MapPin, Bell, Search, Shield, Zap, Star, SlidersHorizontal, ArrowRight,
  Sparkles, Clock3, BadgeCheck, ChevronRight, Wrench, Paintbrush, Leaf,
  Camera, Car, Monitor, Home as HomeIcon, CheckCircle2, CircleUserRound,
  MousePointer2, Mic, TrendingUp, ThumbsUp, ShieldCheck, UserCheck,
  Quote, MessageCircleHeart, HandCoins, Timer
} from 'lucide-react';
import { getServiceImage } from '../assets/serviceImages';
import rajeshAvatar from '../assets/experts/rajesh.png';
import arjunAvatar from '../assets/experts/arjun.png';
import onamBanner from '../assets/banners/onam_banner.png';

const featured = [
  { id: 'plumbing', name: 'Plumbing', bg: 'from-blue-50 to-blue-100', accent: '#2E7D32' },
  { id: 'electrical', name: 'Electrician', bg: 'from-yellow-50 to-amber-100', accent: '#1B5E20' },
  { id: 'cleaning', name: 'House Cleaning', bg: 'from-purple-50 to-violet-100', accent: '#2E7D32' },
  { id: 'ac', name: 'AC & Appliance', bg: 'from-sky-50 to-cyan-100', accent: '#1B5E20' },
  { id: 'carpentry', name: 'Carpentry', bg: 'from-orange-50 to-amber-100', accent: '#2E7D32' },
];

const homeServices = [
  { id: 'plumbing', name: 'Plumbing', tag: 'Leaks, Taps, Pipes' },
  { id: 'electrical', name: 'Electrician', tag: 'Wiring & Repairs' },
  { id: 'cleaning', name: 'House Cleaning', tag: 'Deep & Sanitize' },
  { id: 'painting', name: 'Painting', tag: 'Walls & Wood' },
  { id: 'gardening', name: 'Gardening', tag: 'Plants & Lawn' },
  { id: 'appliances', name: 'Appliances', tag: 'AC, Fridge, WM' },
  { id: 'carpentry', name: 'Carpentry', tag: 'Furniture & Wood' },
  { id: 'cctv', name: 'CCTV', tag: 'Security Setup' },
  { id: 'vehicle', name: 'Recovery Van', tag: 'Towing & Help' },
  { id: 'photo', name: 'Photography', tag: 'Events & Shoots' },
];

const quickChips = [
  { id: 'pop', label: '🔥 Popular', active: true },
  { id: '500', label: 'Under ₹499', active: false },
  { id: 'day', label: '⚡ Same Day', active: false },
  { id: 'top', label: '⭐ Top Rated', active: false },
];

const featuredExperts = [
  { id: 1, name: 'Rajesh Kumar', role: 'Expert Electrician', avatar: rajeshAvatar, rating: '4.9', price: '450', experience: 12, reviews: 128, location: 'Kakkanad' },
  { id: 2, name: 'Suresh Menon', role: 'Pro Plumber', avatar: arjunAvatar, rating: '4.8', price: '399', experience: 10, reviews: 96, location: 'Edapally' },
  { id: 3, name: 'Akhil Varma', role: 'AC Specialist', avatar: null, rating: '4.9', price: '549', experience: 9, reviews: 74, location: 'Vyttila' },
];

function ServiceTile({ name, tag, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 text-left transition-all active:scale-[0.98] hover:shadow-[0_6px_20px_rgba(46,125,50,0.10)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#F0FDF4] to-[#E8F5E9] border border-[#C8E6C9]/40 shadow-sm relative">
        <img
          src={getServiceImage(name)}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col gap-0.5 w-full px-0.5">
        <h3 className="text-[13.5px] font-extrabold text-[#111] tracking-[-0.01em] leading-tight">{name}</h3>
        <p className="text-[11px] font-medium text-gray-500 leading-snug truncate w-full">{tag}</p>
      </div>
    </button>
  );
}

function FeaturedCarousel({ categories, onPick }) {
  return (
    <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-3 scrollbar-hide">
      {categories.map((c, i) => {
        const matchBy = c.id === 'ac' ? 'AC & Appliance Repair' : c.name;
        return (
          <button
            key={c.id}
            onClick={() => onPick(matchBy)}
            className={`shrink-0 w-[160px] h-[200px] rounded-3xl overflow-hidden relative transition-all active:scale-[0.98] bg-gradient-to-br ${c.bg} shadow-[0_6px_20px_rgba(0,0,0,0.06)] border border-white`}
          >
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <div className="flex flex-col gap-1 items-start relative z-10">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white"
                  style={{ backgroundColor: c.accent }}
                >
                  #{i + 1} Trending
                </span>
                <h3 className="text-[15.5px] font-extrabold text-[#1B1B1B] tracking-[-0.01em] leading-tight mt-1.5">
                  {c.name}
                </h3>
                <p className="text-[11px] font-semibold text-gray-600/80 leading-snug">
                  Book nearest verified pro
                </p>
              </div>
              <div className="flex items-end justify-between relative z-10">
                <div className="flex items-center gap-1 bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow-sm border border-white">
                  <Star size={10} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} />
                  <span className="text-[10.5px] font-extrabold text-[#1B1B1B]">4.8 · 1.2k</span>
                </div>
                <div
                  className="w-8 h-8 rounded-full shadow-md flex items-center justify-center text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: c.accent }}
                >
                  <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-[110px] h-[110px] rounded-3xl overflow-hidden m-3 opacity-90 shadow-md">
              <img src={getServiceImage(matchBy)} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ExpertCard({ expert, onBook }) {
  return (
    <div className="shrink-0 w-[230px] bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden transition-all active:scale-[0.99] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
      <div className="relative p-3 pb-2 flex gap-3 items-start">
        <div className="relative shrink-0">
          <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
            {expert.avatar ? (
              <img src={expert.avatar} alt={expert.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[20px] font-extrabold text-white bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]">
                {expert.name?.[0] || 'S'}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <BadgeCheck size={13} className="text-[#2E7D32]" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-[13.5px] font-extrabold text-[#111] tracking-[-0.01em] truncate leading-tight">{expert.name}</h3>
          <p className="text-[11px] font-semibold text-gray-500 leading-snug truncate mt-0.5">{expert.role}</p>
          <div className="flex items-center gap-1 mt-1.5 bg-[#FFF3E0] w-fit px-2 py-0.5 rounded-full border border-[#FFE0B2]">
            <Star size={9} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} />
            <span className="text-[10px] font-extrabold text-[#FF6F00]">{expert.rating}</span>
            <span className="text-[9.5px] font-semibold text-[#FF6F00]/70">({expert.reviews})</span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[10.5px] font-semibold text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={10} strokeWidth={2.5} className="text-[#2E7D32]" /> {expert.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 size={10} strokeWidth={2.5} className="text-[#2E7D32]" /> {expert.experience}+yrs
          </span>
        </div>
        <div className="flex justify-between items-end pt-2 border-t border-gray-100">
          <div>
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Starting</span>
            <span className="text-[15px] font-extrabold text-[#1B1B1B] tracking-[-0.01em] leading-tight">₹{expert.price}</span>
          </div>
          <button
            onClick={onBook}
            className="bg-[#2E7D32] text-white px-4 py-2 rounded-xl text-[11.5px] font-bold flex items-center gap-1 shadow-[0_4px_12px_rgba(46,125,50,0.32)] active:scale-95 transition-transform"
          >
            Book <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home({ navigate }) {
  const openService = (categoryName) => navigate('services', null, categoryName);
  const openAllServices = () => navigate('services', null, null);

  return (
    <div className="bg-gray-50 min-h-screen pb-36 font-['Inter',sans-serif] text-[#111]">
      {/* ====== HERO GREEN BANNER ====== */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-[310px] bg-gradient-to-b from-[#1B5E20] via-[#2E7D32] to-[#2E7D32]/92" />
        <div className="absolute right-[-60px] top-[-50px] w-[200px] h-[200px] rounded-full bg-white/8" />
        <div className="absolute left-[-40px] top-[150px] w-[140px] h-[140px] rounded-full bg-white/5" />
        <div className="absolute right-10 top-[140px] w-[70px] h-[70px] rounded-full bg-white/5" />

        <div className="relative px-5 pt-8">
          {/* HEADER: greeting + profile + bell */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-[46px] h-[46px] rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0 overflow-hidden">
                <CircleUserRound size={28} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-white/70 font-semibold tracking-wide leading-tight">Good morning,</span>
                <h1 className="text-[18.5px] font-extrabold text-white tracking-[-0.015em] leading-tight mt-0.5">Let's get things fixed ✨</h1>
                <button className="flex items-center gap-1 mt-1 text-[12.5px] text-white/92 font-semibold active:opacity-80 w-fit">
                  <MapPin size={13.5} strokeWidth={2.5} fill="none" />
                  Kochi, Kerala
                  <ChevronRight size={12} strokeWidth={3} className="opacity-70" />
                </button>
              </div>
            </div>
            <button className="w-[46px] h-[46px] rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white relative active:scale-95 transition-transform shrink-0">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-[12px] right-[12px] w-[9px] h-[9px] bg-[#FF6F00] rounded-full border-2 border-[#1B5E20] shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"></span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.14)] mb-5 border border-white/90">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0 shadow-sm">
              <Search size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <input
              type="text"
              placeholder="Search plumber, electrician, AC repair..."
              className="bg-transparent border-none outline-none text-[14px] font-semibold flex-1 text-[#1B1B1B] placeholder-gray-400 min-w-0"
            />
            <button className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#C8E6C9]/50 flex items-center justify-center text-[#2E7D32] active:scale-95 transition-transform shrink-0">
              <Mic size={17} strokeWidth={2.5} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform shrink-0">
              <SlidersHorizontal size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* QUICK CHIPS ROW */}
          <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-3 scrollbar-hide">
            {quickChips.map(chip => (
              <button
                key={chip.id}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[11.5px] font-bold transition-all active:scale-95 shadow-sm border
                  ${chip.active
                    ? 'bg-white text-[#1B5E20] border-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]'
                    : 'bg-white/15 text-white border-white/25 backdrop-blur-sm'}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* ====== TRUST BAR (3 pills floating out of hero bottom) ====== */}
        <div className="relative px-5 pb-4 -mt-1 z-10">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 grid grid-cols-3 divide-x divide-gray-100 p-3">
            <div className="flex flex-col items-center text-center px-1 gap-1">
              <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] flex items-center justify-center shrink-0 mb-1">
                <Timer size={16} strokeWidth={2.5} className="text-[#FF6F00]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-[#111] leading-tight tracking-[-0.01em]">30-min ETA</span>
              <span className="text-[9.5px] font-semibold text-gray-500 leading-tight">Fastest in city</span>
            </div>
            <div className="flex flex-col items-center text-center px-1 gap-1">
              <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0 mb-1">
                <UserCheck size={16} strokeWidth={2.5} className="text-[#2E7D32]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-[#111] leading-tight tracking-[-0.01em]">100% Verified</span>
              <span className="text-[9.5px] font-semibold text-gray-500 leading-tight">Background checked</span>
            </div>
            <div className="flex flex-col items-center text-center px-1 gap-1">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0 mb-1">
                <HandCoins size={16} strokeWidth={2.5} className="text-[#1D4ED8]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-[#111] leading-tight tracking-[-0.01em]">Pay After</span>
              <span className="text-[9.5px] font-semibold text-gray-500 leading-tight">Only when happy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-2">
        {/* ====== FEATURED CATEGORIES CAROUSEL ====== */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 pr-1">
            <div>
              <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.015em] leading-tight">🔥 Trending Services</h2>
              <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">Most booked this week in your area</p>
            </div>
            <button
              onClick={openAllServices}
              className="flex items-center gap-0.5 text-[11.5px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-full active:scale-95 transition-transform border border-[#C8E6C9]/60"
            >
              All <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>
          <FeaturedCarousel categories={featured} onPick={openService} />
        </div>

        {/* ====== OFFER BANNER (Onam) ====== */}
        <div className="mb-8 relative w-full rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.10)] border border-white active:scale-[0.997] transition-transform">
          <div
            className="w-full h-[148px] bg-cover bg-center"
            style={{ backgroundImage: `url(${onamBanner})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A3D0A]/88 via-[#1B5E20]/65 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex flex-col items-start max-w-[72%]">
              <span className="bg-[#FF6F00] text-[10px] font-extrabold px-3 py-1 rounded-full mb-2 inline-block tracking-wider text-white shadow-[0_4px_10px_rgba(255,111,0,0.45)] uppercase">
                🎉 Onam Mega Offer
              </span>
              <h2 className="text-[23px] font-black text-white leading-[1.05] tracking-[-0.02em] drop-shadow-sm">Flat 20% OFF</h2>
              <p className="text-[12.5px] font-semibold text-white/90 mt-1.5 leading-snug">On all home services. Limited time only!</p>
            </div>
            <div className="flex items-end justify-between">
              <button className="bg-white text-[#1B5E20] text-[12px] font-extrabold px-4.5 py-2.5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95 transition-transform flex items-center gap-1 h-fit">
                Claim Now <ArrowRight size={12} strokeWidth={2.5} />
              </button>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[20px] font-black text-white/95 leading-none tracking-tight">*T&C</span>
                <span className="text-[9.5px] font-semibold text-white/70 leading-tight">Apply. Min order ₹599</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====== FULL SERVICE GRID (10 tiles) ====== */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 pr-1">
            <div>
              <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.015em] leading-tight">What do you need today?</h2>
              <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">10+ services. 500+ verified experts near you.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {homeServices.map(s => (
              <ServiceTile
                key={s.id}
                name={s.name}
                tag={s.tag}
                onClick={() => openService(s.name)}
              />
            ))}
          </div>
        </div>

        {/* ====== INSTANT AUTO-ASSIGN CARD ====== */}
        <button
          onClick={openAllServices}
          className="w-full mb-8 relative overflow-hidden rounded-3xl p-5 flex items-center gap-4 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#2E7D32] text-white shadow-[0_10px_30px_rgba(46,125,50,0.38)] active:scale-[0.995] transition-transform"
        >
          <div className="absolute -right-14 -top-14 w-[180px] h-[180px] rounded-full bg-white/9" />
          <div className="absolute -right-24 -bottom-28 w-[240px] h-[240px] rounded-full bg-white/5" />
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/18 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/25">
            <Sparkles size={24} strokeWidth={2} />
          </div>
          <div className="relative z-10 flex-1 text-left pr-3">
            <p className="text-[15.5px] font-extrabold tracking-[-0.01em] leading-tight">⚡ Instant Auto-Assign</p>
            <p className="text-[11.5px] text-white/85 mt-1 font-medium leading-snug">
              Tell us the problem, we'll match the nearest available pro in <b className="text-white">under 60 seconds</b>.
            </p>
          </div>
          <div className="relative z-10 w-11 h-11 rounded-2xl bg-white text-[#1B5E20] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </button>

        {/* ====== HOW IT WORKS (3 steps) ====== */}
        <div className="mb-8">
          <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.015em] mb-1 leading-tight">How it works</h2>
          <p className="text-[11.5px] text-gray-500 font-medium mb-4">Getting a pro is this simple 👇</p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { n: '01', title: 'Choose', desc: 'Pick a service', Icon: MousePointer2, tint: '#F0FDF4', ink: '#2E7D32' },
              { n: '02', title: 'Schedule', desc: 'Pick date & time', Icon: Clock3, tint: '#FFF7ED', ink: '#FF6F00' },
              { n: '03', title: 'Relax', desc: 'We do the rest', Icon: CheckCircle2, tint: '#EFF6FF', ink: '#1D4ED8' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-2 right-2.5 text-[11px] font-black text-gray-900/5 tracking-widest leading-none">{s.n}</div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: s.tint }}>
                  <s.Icon size={17} strokeWidth={2.5} style={{ color: s.ink }} />
                </div>
                <h3 className="text-[13.5px] font-extrabold text-[#111] tracking-[-0.01em] leading-tight mb-0.5">{s.title}</h3>
                <p className="text-[10.5px] font-semibold text-gray-500 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ====== TOP EXPERTS HORIZONTAL CAROUSEL ====== */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 pr-1">
            <div>
              <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.015em] leading-tight">⭐ Top Rated Experts</h2>
              <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">Handpicked. Verified. 5-star rated.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6F00] bg-[#FFF3E0] px-2.5 py-1.5 rounded-full border border-[#FFE0B2]">
              <Star size={10} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} /> 4.8 avg
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-3 scrollbar-hide">
            {featuredExperts.map(e => (
              <ExpertCard key={e.id} expert={e} onBook={() => openService(e.role.includes('AC') ? 'AC & Appliance Repair' : e.role.includes('Plumber') ? 'Plumbing' : 'Electrician')} />
            ))}
          </div>
        </div>

        {/* ====== TESTIMONIAL CARD ====== */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF7ED] via-white to-[#F0FDF4] border border-[#C8E6C9]/60 p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <div className="absolute top-4 right-5 opacity-[0.07]">
            <Quote size={64} strokeWidth={1} />
          </div>
          <div className="flex items-center gap-1 mb-3 relative z-10">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={13} fill="#FF6F00" color="#FF6F00" strokeWidth={2.5} />
            ))}
            <span className="text-[11px] font-extrabold text-[#FF6F00] ml-1.5">5.0 · 28 reviews</span>
          </div>
          <p className="text-[13.5px] font-semibold text-[#1B1B1B] leading-[1.5] tracking-[-0.005em] mb-4 relative z-10 pr-4">
            "Rajesh the electrician arrived in <b className="text-[#1B5E20]">22 minutes</b>, fixed my AC and wiring in an hour. Clean, polite, transparent pricing. Best service app I've used."
          </p>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center text-white text-[14px] font-black shadow-sm border border-white">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-extrabold text-[#111] tracking-[-0.01em] leading-tight">Devika Nair</span>
              <span className="text-[11px] font-semibold text-gray-500 leading-tight mt-0.5">📍 Kochi · Verified Customer</span>
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-1 text-[#2E7D32]">
              <MessageCircleHeart size={16} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* ====== WHY CHOOSE (4 cards) ====== */}
        <div className="mb-4">
          <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.015em] mb-4 leading-tight">Why choose <span className="text-[#2E7D32]">Seva</span>?</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#C8E6C9]/70 shadow-[0_1px_3px_rgba(46,125,50,0.04)] relative overflow-hidden">
              <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-[#C8E6C9]/30" />
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm border border-[#C8E6C9]/60 relative z-10">
                <BadgeCheck size={20} className="text-[#2E7D32]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-extrabold text-[#1B5E20] tracking-[-0.01em] leading-tight mb-0.5 relative z-10">Verified Pros</h3>
              <p className="text-[11px] font-semibold text-[#4A6B4A] leading-snug relative z-10">100% background & police verified experts.</p>
            </div>
            <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FFE0B2]/70 shadow-[0_1px_3px_rgba(255,111,0,0.04)] relative overflow-hidden">
              <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-[#FFE0B2]/40" />
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm border border-[#FFE0B2]/60 relative z-10">
                <Zap size={20} className="text-[#FF6F00]" strokeWidth={2.5} fill="currentColor" />
              </div>
              <h3 className="text-[13.5px] font-extrabold text-[#9A3412] tracking-[-0.01em] leading-tight mb-0.5 relative z-10">Instant Booking</h3>
              <p className="text-[11px] font-semibold text-[#B45309] leading-snug relative z-10">Book under 60 seconds. Same day slots.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-gray-200/50" />
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm border border-gray-200 relative z-10">
                <ShieldCheck size={20} className="text-gray-700" strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-extrabold text-gray-800 tracking-[-0.01em] leading-tight mb-0.5 relative z-10">Transparent</h3>
              <p className="text-[11px] font-semibold text-gray-500 leading-snug relative z-10">Upfront pricing. No hidden fees ever.</p>
            </div>
            <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FFE0B2]/70 shadow-[0_1px_3px_rgba(255,111,0,0.04)] relative overflow-hidden">
              <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-[#FFE0B2]/40" />
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm border border-[#FFE0B2]/60 relative z-10">
                <ThumbsUp size={20} className="text-[#FF6F00]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-extrabold text-[#9A3412] tracking-[-0.01em] leading-tight mb-0.5 relative z-10">Quality Assured</h3>
              <p className="text-[11px] font-semibold text-[#B45309] leading-snug relative z-10">Unsatisfied? Free re-service within 7 days.</p>
            </div>
          </div>
        </div>

        {/* small spacer so content doesn't get cut under nav */}
        <div className="h-6" />
      </div>
    </div>
  );
}
