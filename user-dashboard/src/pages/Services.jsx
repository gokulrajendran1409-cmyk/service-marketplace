import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, ChevronRight, Clock3, LocateFixed, MapPin, Search, ShieldCheck, Sparkles, Star, UserRound, Wrench, Zap, SlidersHorizontal } from 'lucide-react';
import { API } from '../constants';
import { BookingModal } from '../components/BookingModal';
import rajesh from '../assets/experts/rajesh.png';

const FALLBACK_SERVICES = [
  { id: 'cleaning', name: 'Cleaning', description: 'Deep cleaning for your home' }, { id: 'electrical', name: 'Electrical', description: 'Safe repairs by verified electricians' },
  { id: 'plumbing', name: 'Plumbing', description: 'Leaks, installations and repairs' }, { id: 'painting', name: 'Painting', description: 'Freshen up every room' },
  { id: 'gardening', name: 'Gardening & Landscaping', description: 'Care for your outdoor space' }, { id: 'appliances', name: 'AC & Appliance Repair', description: 'Trusted appliance specialists' },
];
const iconFor = (name) => /electric/i.test(name) ? Zap : /plumb/i.test(name) ? Wrench : /clean/i.test(name) ? Sparkles : Wrench;
const rate = (pro) => Number(pro.wage) || 399;

export default function Services({ navigate, initialCategory }) {
  const [categories, setCategories] = useState([]); 
  const [selected, setSelected] = useState(null); 
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [expertLoading, setExpertLoading] = useState(false); 
  const [booking, setBooking] = useState(null); 
  const [search, setSearch] = useState('');
  
  const visible = useMemo(() => categories.filter(item => item.name.toLowerCase().includes(search.toLowerCase())), [categories, search]);
  
  useEffect(() => { 
    fetch(`${API}/categories`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(Array.isArray(data) && data.length ? data : FALLBACK_SERVICES))
      .catch(() => setCategories(FALLBACK_SERVICES))
      .finally(() => setLoading(false)); 
  }, []);
  
  const choose = async (category) => { 
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
  
  useEffect(() => { 
    if (!initialCategory || !categories.length || selected) return; 
    const target = categories.find(item => item.name === initialCategory || item.name.toLowerCase().includes(initialCategory.toLowerCase())); 
    if (target) choose(target); 
  }, [initialCategory, categories]);
  
  // After a booking is created successfully → go to My Bookings to see the real data
  const complete = () => {
    setBooking(null);
    navigate('requests');
  };

  if (selected) {
    const Icon = iconFor(selected.name);
    return (
      <div className="min-h-screen bg-[#FFFBF0] px-5 pb-[120px] font-['Inter',sans-serif]">
        <header className="h-[76px] -mx-5 px-5 flex items-center justify-between border-b border-gray-100 bg-[#FFFBF0]">
          <button onClick={() => setSelected(null)} className="w-[42px] h-[42px] rounded-[14px] bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#2E7D32] active:scale-95 transition-transform">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="m-0 text-[18px] text-[#0A3D0A] font-bold tracking-[-0.02em]">Find Experts</h1>
          <button className="w-[42px] h-[42px] rounded-[14px] bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#2E7D32] active:scale-95 transition-transform">
            <SlidersHorizontal size={20} strokeWidth={2.5} />
          </button>
        </header>

        <section className="mt-5 mb-5 flex flex-col">
          <h2 className="text-[14px] font-medium text-gray-500 mb-4">
            {experts.length > 0 ? experts.length : 0} Professionals in your area
          </h2>

          <div className="flex items-center gap-3 bg-white p-4 rounded-[20px] shadow-sm mb-5 border border-gray-100">
            <Search size={20} className="text-gray-400" strokeWidth={2.5} />
            <input placeholder="Search by name or area..." className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-gray-800 placeholder-gray-400" />
          </div>

          {/* Auto-assign option */}
          <button
            onClick={() => setBooking({ professional: null, category: selected.name })}
            className="w-full flex items-center gap-3 bg-[#2E7D32] text-white rounded-[20px] p-4 mb-4 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(46,125,50,0.3)]">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-bold">Auto-Assign an Expert</p>
              <p className="text-[11px] text-white/80">We find the nearest available {selected.name} expert for you</p>
            </div>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <button className="bg-[#2E7D32] text-white px-4 py-2 rounded-full text-[13px] font-bold shrink-0">Nearby</button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-[13px] font-bold shrink-0">Top Rated</button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-[13px] font-bold shrink-0">Price: Low</button>
          </div>
        </section>

        {expertLoading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-8 h-8 border-[2.5px] border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] font-medium text-gray-500">Finding nearby experts...</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[15px] font-bold text-[#0A3D0A] mb-1">No experts found nearby</p>
            <p className="text-[13px] font-medium text-gray-500 mb-5">Try auto-assign and we'll notify available professionals</p>
            <button
              onClick={() => setBooking({ professional: null, category: selected.name })}
              className="bg-[#FF7A00] text-white px-6 py-3 rounded-[14px] text-[13px] font-bold active:scale-95 transition-transform shadow-md">
              <Sparkles size={15} className="inline mr-1.5" /> Auto-Assign Expert
            </button>
          </div>
        ) : (
          <section className="flex flex-col gap-4">
            {experts.map((expert, index) => (
              <ProviderCard key={expert.id} expert={expert} index={index}
                onBook={() => setBooking({ professional: expert, category: selected.name })} />
            ))}
          </section>
        )}

        <aside className="bg-[#E8F5E9] border border-[#C8E6C9] p-5 rounded-[24px] flex gap-4 mt-6 items-start shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#FFFBF0] flex items-center justify-center shrink-0 border border-[#C8E6C9]">
            <ShieldCheck size={22} className="text-[#2E7D32]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <b className="text-[14px] text-[#1B3A1B] tracking-[-0.01em]">100% Satisfaction Guarantee</b>
            <small className="text-[12px] font-medium text-[#4A6B4A] leading-snug mt-1">All Seva partners go through rigorous 3-step background checks.</small>
          </div>
        </aside>

        {/* BookingModal — opens here with real data */}
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

  return (
    <div className="min-h-screen bg-[#FFFBF0] px-5 pb-[120px] font-['Inter',sans-serif]">
      <header className="h-[76px] -mx-5 px-5 flex items-center justify-between border-b border-gray-100 bg-[#FFFBF0]">
        <button onClick={() => navigate('home')} className="w-[42px] h-[42px] rounded-[14px] bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#2E7D32] active:scale-95 transition-transform">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="m-0 text-[18px] text-[#0A3D0A] font-bold tracking-[-0.02em]">All Services</h1>
        <span className="w-[42px]"/>
      </header>

      <div className="flex items-center gap-3 bg-white p-4 rounded-[20px] shadow-sm mt-5 mb-6 border border-gray-100">
        <Search size={20} className="text-gray-400" strokeWidth={2.5} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services" className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-gray-800 placeholder-gray-400" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em]">Home Services</h2>
        <span className="text-[13px] font-bold text-[#2E7D32]">{visible.length} services</span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[14px] font-medium text-gray-500">Loading services...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((service, index) => { 
            const Icon = iconFor(service.name); 
            return (
              <button key={service.id || service.name} className="flex items-center gap-4 w-full bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 text-left active:scale-95 transition-all hover:shadow-md" onClick={() => choose(service)}>
                <div className="w-14 h-14 rounded-[16px] bg-[#FFFBF0] flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-[#2E7D32]" />
                </div>
                <div className="flex-1 flex flex-col">
                  <b className="text-[15px] font-bold text-[#0A3D0A] tracking-[-0.01em] mb-1">{service.name}</b>
                  <span className="text-[12px] font-medium text-gray-500 leading-snug">{service.description || 'Book a reliable expert today'}</span>
                </div>
                <ChevronRight size={22} className="text-gray-300" strokeWidth={2.5} />
              </button>
            ); 
          })}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ expert, index, onBook }) {
  const avatar = expert.profile_photo || (index === 0 ? rajesh : null); 
  return (
    <article className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 relative">
      <div className="flex gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            {avatar ? <img src={avatar} alt={expert.full_name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[24px] font-bold text-gray-400 bg-gray-50">{expert.full_name?.[0] || 'S'}</div>}
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle2 size={18} className="text-[#2E7D32]" fill="#FFFBF0" />
          </div>
        </div>
        <div className="flex-1 flex flex-col pt-1">
          <div className="flex justify-between items-start">
            <h3 className="text-[16px] font-bold text-[#0A3D0A] tracking-[-0.01em]">{expert.full_name || 'Verified expert'}</h3>
            <div className="flex items-center gap-1">
              <Star size={14} fill="#FF7A00" color="#FF7A00" />
              <span className="text-[13px] font-bold text-[#FF7A00]">4.9</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{expert.category || 'Expert'}</span>
            <span className="text-[11px] font-medium text-gray-400">(128 reviews)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={14} /> Kochi, Kerala</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-gray-500 border-t border-gray-100 pt-3">
             <span className="flex items-center gap-1"><Clock3 size={14} /> {expert.experience_years || 12}+ Years</span>
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             <span className="flex items-center gap-1"><ShieldCheck size={14} /> Licensed</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starts From</span>
           <span className="text-[16px] font-bold text-[#0A3D0A]">Rs. {rate(expert)}<span className="text-[12px] font-medium text-gray-500">/visit</span></span>
        </div>
        <button className="bg-[#2E7D32] text-white px-6 py-3 rounded-[14px] text-[13px] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform" onClick={onBook}>
          Book Now <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
}
