import React from 'react';
import { MapPin, Bell, Search, Shield, Zap, Star, SlidersHorizontal } from 'lucide-react';
import cleaningIcon from '../assets/services/cleaning.png';
import electricianIcon from '../assets/services/electrician.png';
import plumbingIcon from '../assets/services/plumbing.png';
import paintingIcon from '../assets/services/painting.png';
import gardeningIcon from '../assets/services/gardening.png';
import appliancesIcon from '../assets/services/appliances.png';
import rajeshAvatar from '../assets/experts/rajesh.png';
import arjunAvatar from '../assets/experts/arjun.png';
import onamBanner from '../assets/banners/onam_banner.png';

const services = [
  { id: 'cleaning', name: 'Cleaning', icon: cleaningIcon },
  { id: 'electrician', name: 'Electrician', icon: electricianIcon },
  { id: 'plumbing', name: 'Plumbing', icon: plumbingIcon },
  { id: 'painting', name: 'Painting', icon: paintingIcon },
  { id: 'gardening', name: 'Gardening', icon: gardeningIcon },
  { id: 'appliances', name: 'Appliances', icon: appliancesIcon },
];

const featuredExperts = [
  { id: 1, name: 'Rajesh Kumar', role: 'Expert Electrician', avatar: rajeshAvatar, rating: '4.9', price: '450' },
  { id: 2, name: 'Suresh Menon', role: 'Pro Plumber', avatar: arjunAvatar, rating: '4.8', price: '399' }
];

export default function Home({ navigate }) {
  return (
    <div className="pt-8 px-5 bg-[#FFFBF0] min-h-screen pb-32 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Location</span>
          <button className="flex items-center gap-1.5 text-[#2E7D32]">
            <MapPin size={16} strokeWidth={2.5} />
            <span className="font-bold text-[15px] text-[#0A3D0A]">Kochi, Kerala</span>
          </button>
        </div>
        <button className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#2E7D32] relative">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#FF6F00] rounded-full border border-white"></span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm mb-7 border border-gray-100">
        <Search size={20} className="text-gray-400" strokeWidth={2.5} />
        <input 
          type="text" 
          placeholder="Search for 'Electrician' or 'Plumber'..." 
          className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-gray-800 placeholder-gray-400"
        />
        <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>
        <button className="text-[#2E7D32]">
          <SlidersHorizontal size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Onam Banner */}
      <div 
        className="w-full h-[180px] rounded-[24px] bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] mb-8 relative overflow-hidden p-6 flex flex-col justify-center shadow-md"
        style={{ backgroundImage: `url(${onamBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/30 rounded-[24px]"></div>
        <div className="relative z-10 text-white">
          <span className="bg-[#FF6F00] text-[10px] font-bold px-2.5 py-1 rounded-md mb-3 inline-block tracking-wide shadow-sm">
            ONAM SPECIAL
          </span>
          <h2 className="text-[22px] font-bold leading-tight max-w-[220px] tracking-[-0.02em]">Get 20% OFF on All Home Services</h2>
          <p className="text-[12px] mt-2 font-medium opacity-90 max-w-[200px]">Book now to celebrate with a sparkling home!</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[20px] font-bold text-[#0A3D0A] tracking-[-0.02em]">Our Services</h2>
          <button className="text-[13px] font-semibold text-[#2E7D32] flex items-center gap-1 active:opacity-70">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {services.map(service => (
            <button 
              key={service.id} 
              onClick={() => navigate('services')}
              className="flex flex-col items-center bg-white pt-4 pb-3 rounded-[20px] shadow-sm border border-gray-100 transition-all active:scale-95 hover:shadow-md"
            >
              <div className="w-[56px] h-[56px] rounded-xl bg-[#FFFBF0] flex items-center justify-center mb-2 overflow-hidden">
                <img src={service.icon} alt={service.name} className="w-[32px] h-[32px] object-contain" />
              </div>
              <span className="text-[12px] font-semibold text-[#0A3D0A]">{service.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Experts */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[20px] font-bold text-[#0A3D0A] tracking-[-0.02em]">Featured Experts</h2>
          <span className="text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full flex items-center gap-1">
            ↗ High Rated
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-4">
          {featuredExperts.map(expert => (
            <div key={expert.id} className="min-w-[200px] bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
              <div className="h-[120px] w-full bg-gray-100 relative">
                <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm">
                  <Shield size={16} className="text-[#2E7D32]" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-[15px] font-bold text-[#0A3D0A] tracking-[-0.01em]">{expert.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#FF7A00]">
                    <Star size={12} fill="#FF7A00" color="#FF7A00" /> {expert.rating}
                  </div>
                </div>
                <p className="text-[12px] font-medium text-gray-500 mb-4">{expert.role}</p>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="text-[14px] font-bold text-[#2E7D32]">
                    Rs. {expert.price}<span className="text-[11px] font-medium text-gray-500">/hr</span>
                  </div>
                  <button className="text-[12px] font-bold text-[#2E7D32] bg-white border-2 border-[#2E7D32] rounded-xl px-4 py-1.5 active:bg-[#2E7D32] active:text-white transition-colors">
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why choose Seva */}
      <div>
        <h2 className="text-[18px] font-bold text-[#0A3D0A] mb-4 tracking-[-0.02em]">Why choose Seva?</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#E8F5E9] rounded-[20px] p-4 flex gap-3 items-start border border-[#C8E6C9]">
            <Shield size={20} className="text-[#2E7D32] shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#1B3A1B] mb-1">Verified Experts</span>
              <span className="text-[11px] font-medium text-[#4A6B4A] leading-snug">100% background checked professionals.</span>
            </div>
          </div>
          <div className="bg-[#FFF3E0] rounded-[20px] p-4 flex gap-3 items-start border border-[#FFE0B2]">
            <Zap size={20} className="text-[#FF7A00] shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#E65100] mb-1">Instant Booking</span>
              <span className="text-[11px] font-medium text-[#B26A00] leading-snug">Book a service in under 60 seconds.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
