import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, CreditCard, Download, Home, Info, MapPin, Phone, ShieldCheck, Share2, WalletCards } from 'lucide-react';
import rajeshAvatar from '../assets/experts/rajesh.png';
import confirmedBg from '../assets/illustrations/confirmed_bg.png';
import mapBg from '../assets/illustrations/map_bg.png';

const Stepper = ({ step }) => (
  <div className="flex justify-between px-2 pt-6 pb-5 relative font-['Inter',sans-serif]">
    <div className="absolute top-[36px] left-[15%] w-[70%] h-[2px] bg-gray-100 z-0"></div>
    {['Schedule', 'Address', 'Payment'].map((name, i) => {
      const isPast = i + 1 < step;
      const isCurrent = i + 1 === step;
      return (
        <div key={name} className="relative z-10 flex flex-col items-center gap-2 w-16">
          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-bold transition-colors shadow-sm ${isPast || isCurrent ? 'bg-[#2E7D32] text-white border-none' : 'bg-white text-gray-400 border border-gray-200'}`}>
            {isPast ? <Check size={16} strokeWidth={3} /> : (i + 1)}
          </span>
          <span className={`text-[11px] font-bold tracking-wide ${isPast || isCurrent ? 'text-[#0A3D0A]' : 'text-gray-400'}`}>{name}</span>
        </div>
      );
    })}
  </div>
);

const BackHeader = ({ title, onBack }) => (
  <header className="h-[76px] -mx-5 px-5 flex items-center justify-between border-b border-gray-100 bg-[#FFFBF0] font-['Inter',sans-serif]">
    <button onClick={onBack} className="w-[42px] h-[42px] rounded-[14px] bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#2E7D32] active:scale-95 transition-transform">
      <ArrowLeft size={22} strokeWidth={2.5} />
    </button>
    <h1 className="m-0 text-[18px] text-[#0A3D0A] font-bold tracking-[-0.02em]">{title}</h1>
    <span className="w-[42px]"></span>
  </header>
);

export function ScheduleService({ navigate }) { 
  const [selected, setSelected] = useState('10:00 AM'); 
  const slots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM']; 
  
  return (
    <div className="min-h-screen bg-[#FFFBF0] px-5 pb-[120px] font-['Inter',sans-serif]">
      <BackHeader title="Schedule Service" onBack={() => navigate('home')} />
      <Stepper step={1} />
      
      <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mt-2">
        <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em]">Select Date</h2>
        <div className="flex items-center justify-between my-5">
          <button className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center active:scale-95 transition-transform">‹</button>
          <b className="text-[15px] font-bold text-[#0A3D0A]">August 2026</b>
          <button className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center active:scale-95 transition-transform">›</button>
        </div>
        <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => <small key={day} className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">{day}</small>)}
          {Array.from({length:35}, (_, i) => i - 5).map((day, i) => (
            <span key={i} className={`w-9 h-9 flex items-center justify-center rounded-full mx-auto text-[13px] font-bold transition-colors ${day === 29 ? 'bg-[#2E7D32] text-white shadow-md' : day < 1 || day > 31 ? 'text-transparent' : 'text-[#0A3D0A]'}`}>
              {day > 0 && day <= 31 ? day : ''}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em]">Select Time</h2>
          <span className="bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">{selected}</span>
        </div>
        
        <div className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Morning</div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {slots.slice(0, 4).map(slot => (
            <button key={slot} onClick={() => setSelected(slot)} className={`py-3 rounded-[14px] text-[13px] font-bold border transition-all active:scale-95 ${selected === slot ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
              {slot}
            </button>
          ))}
        </div>

        <div className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Afternoon</div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {slots.slice(4, 9).map(slot => (
            <button key={slot} onClick={() => setSelected(slot)} className={`py-3 rounded-[14px] text-[13px] font-bold border transition-all active:scale-95 ${selected === slot ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
              {slot}
            </button>
          ))}
        </div>

        <div className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Evening</div>
        <div className="grid grid-cols-3 gap-3">
          {slots.slice(9, 12).map(slot => (
            <button key={slot} onClick={() => setSelected(slot)} className={`py-3 rounded-[14px] text-[13px] font-bold border transition-all active:scale-95 ${selected === slot ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
              {slot}
            </button>
          ))}
        </div>
      </section>

      <aside className="bg-[#E8F5E9] border border-[#C8E6C9] p-4 rounded-[20px] flex gap-3 mt-6 items-start shadow-sm">
        <Info size={20} className="text-[#2E7D32] shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex flex-col">
          <b className="text-[13px] text-[#1B3A1B]">Professional Punctuality</b>
          <small className="text-[11px] font-medium text-[#4A6B4A] leading-snug mt-1">Your expert will arrive within 15-30 minutes of the selected time slot. Rescheduling is free up to 2 hours before the visit.</small>
        </div>
      </aside>

      <div className="mt-5 flex items-center gap-3 bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center shrink-0">
          <CalendarDays size={20} className="text-[#FF7A00]" />
        </div>
        <div className="flex flex-col">
          <small className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">Scheduled For</small>
          <b className="text-[14px] text-[#0A3D0A]">Saturday, August 29 at {selected}</b>
        </div>
        <CheckCircle2 size={20} className="text-[#2E7D32] ml-auto" />
      </div>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 bg-white border-t border-gray-100 flex items-center justify-between z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col">
          <small className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-0.5">Estimated Duration</small>
          <b className="text-[16px] text-[#0A3D0A]">1 - 2 Hours</b>
        </div>
        <button className="bg-[#FF7A00] text-white flex items-center gap-2 h-14 px-6 rounded-[16px] text-[15px] font-bold shadow-[0_8px_16px_rgba(255,111,0,0.25)] active:scale-95 transition-transform" onClick={() => navigate('addresses')}>
          Proceed to Address <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </footer>
    </div>
  );
}

export function MyAddresses({ navigate }) { 
  const [address, setAddress] = useState('Home'); 
  const entries = [
    ['Home', 'Villa 4B, Emerald Gardens', 'Kakkanad, Kochi, Kerala • 682030', true],
    ['Office', 'Infopark Phase 2, Carnival Building', 'Kakkanad, Ernakulam • 682042', false],
    ['Parents', 'Near St. Mary\'s Church', 'Aluva, Kochi • 683101', false]
  ]; 

  return (
    <div className="min-h-screen bg-[#FFFBF0] px-5 pb-[120px] font-['Inter',sans-serif]">
      <BackHeader title="My Addresses" onBack={() => navigate('schedule')} />
      <Stepper step={2} />
      
      <div className="flex items-center gap-3 bg-white p-4 rounded-[20px] shadow-sm mt-2 border border-gray-100">
        <Search size={20} className="text-gray-400" strokeWidth={2.5} />
        <input placeholder="Search for area, landmark..." className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-gray-800 placeholder-gray-400" />
      </div>
      
      <div className="h-[140px] -mx-5 mt-5 relative overflow-hidden flex items-end justify-end px-5 pb-5" style={{ backgroundImage: `url(${mapBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <button className="bg-white text-[#2E7D32] w-12 h-12 rounded-full flex items-center justify-center shadow-md relative z-10 border border-gray-100 active:scale-95 transition-transform">
          <MapPin size={22} strokeWidth={2.5} />
        </button>
      </div>
      
      <section className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em]">Saved Locations</h2>
          <button className="text-[#2E7D32] text-[13px] font-bold flex items-center gap-1 active:opacity-70">
            + Add New
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          {entries.map(([name, line, city, isDefault]) => (
            <button key={name} className={`flex items-start gap-4 w-full p-4 rounded-[24px] bg-white border text-left transition-all ${address === name ? 'border-[#2E7D32] shadow-[0_0_0_1px_#2E7D32]' : 'border-gray-100 shadow-sm'}`} onClick={() => setAddress(name)}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${address === name ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-gray-50 text-gray-400'}`}>
                {name === 'Office' ? <WalletCards size={22} strokeWidth={2} /> : (name === 'Parents' ? <Info size={22} strokeWidth={2} /> : <Home size={22} strokeWidth={2} />)}
              </div>
              <div className="flex-1 flex flex-col pt-0.5">
                <div className="flex justify-between items-center mb-1.5">
                  <b className="text-[15px] font-bold text-[#0A3D0A] flex items-center gap-2 tracking-[-0.01em]">
                    {name} {isDefault && <span className="bg-white border border-[#2E7D32] text-[#2E7D32] text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider">DEFAULT</span>}
                  </b>
                </div>
                <span className="text-[12px] font-medium text-gray-500 mb-1 leading-snug">{line}</span>
                <span className="text-[11px] text-gray-400 mb-3">{city}</span>
                {address === name && (
                  <div className="flex gap-4 text-[11px] font-bold pt-3 border-t border-gray-100">
                    <span className="text-[#2E7D32] flex items-center gap-1">EDIT</span>
                    <span className="text-gray-200">•</span>
                    <span className="text-red-500 flex items-center gap-1">REMOVE</span>
                  </div>
                )}
              </div>
              <div className="mt-1.5">
                {address === name ? <CheckCircle2 size={22} className="text-[#2E7D32]" /> : <div className="w-[22px] h-[22px] rounded-full border-[2.5px] border-gray-200"></div>}
              </div>
            </button>
          ))}
        </div>
      </section>
      
      <aside className="bg-[#E8F5E9] border border-[#C8E6C9] p-4 rounded-[20px] flex gap-3 mt-6 items-start shadow-sm">
        <CheckCircle2 size={20} className="text-[#2E7D32] shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex flex-col">
          <b className="text-[13px] text-[#1B3A1B]">Active in your region</b>
          <small className="text-[11px] font-medium text-[#4A6B4A] mt-1 leading-snug">Seva provides lightning-fast services across Kochi, Ernakulam, and Aluva regions.</small>
        </div>
      </aside>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 bg-white border-t border-gray-100 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
        <button className="w-full bg-[#FF7A00] text-white flex items-center justify-center gap-2 h-14 rounded-[16px] text-[15px] font-bold shadow-[0_8px_16px_rgba(255,111,0,0.25)] active:scale-95 transition-transform" onClick={() => navigate('payment')}>
          Deliver to this Address
        </button>
      </footer>
    </div>
  );
}

export function Payment({ navigate }) { 
  const [method, setMethod] = useState('UPI'); 
  const methods = [
    [Phone, 'UPI (Google Pay, PhonePe)', 'Pay instantly using any UPI app'],
    [CreditCard, 'Credit / Debit Card', 'Visa, Mastercard, RuPay supported'],
    [WalletCards, 'Cash after Service', 'Pay the expert directly after work']
  ]; 

  return (
    <div className="min-h-screen bg-[#FFFBF0] px-5 pb-[120px] font-['Inter',sans-serif]">
      <BackHeader title="Payment" onBack={() => navigate('addresses')} />
      <Stepper step={3} />
      
      <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mt-2">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em]">Order Summary</h2>
          <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold px-2.5 py-1.5 rounded-lg tracking-wide border border-[#C8E6C9]">Onam Discount Applied</span>
        </div>
        
        <div className="flex items-center gap-3 bg-[#F9FAFB] border border-gray-100 p-4 rounded-[20px] mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
             <Info size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <b className="text-[14px] font-bold text-[#0A3D0A] mb-0.5 tracking-[-0.01em]">Master Plumbing Service</b>
            <span className="text-[11px] font-medium text-gray-500 mb-0.5">Expert: <strong className="text-gray-800">Rajesh Kumar</strong></span>
            <span className="text-[10px] font-medium text-gray-400">Oct 24, 2026 • 10:00 AM - 11:00 AM</span>
          </div>
        </div>
        
        <div className="space-y-3 text-[13px] font-medium">
          <div className="flex justify-between text-gray-500">
            <span>Service Fee</span>
            <span className="font-bold text-gray-800">Rs. 499</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Taxes & Charges</span>
            <span className="font-bold text-gray-800">Rs. 45</span>
          </div>
          <div className="flex justify-between text-[#2E7D32] font-bold">
            <span>Onam Offer (20% OFF)</span>
            <span>- Rs. 50</span>
          </div>
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-dashed border-gray-200">
            <span className="font-bold text-[#0A3D0A] text-[16px]">Total Amount</span>
            <span className="font-bold text-[#2E7D32] text-[18px]">Rs. 494</span>
          </div>
        </div>
      </section>
      
      <section className="mt-7">
        <div className="mb-4">
          <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em] mb-1">Payment Method</h2>
          <p className="text-[12px] font-medium text-gray-500">Choose how you'd like to pay for the service</p>
        </div>
        
        <div className="flex flex-col gap-3">
          {methods.map(([Icon, title, copy]) => (
            <button key={title} className={`flex items-center gap-4 p-4 rounded-[20px] border text-left transition-all ${method === title ? 'border-[#2E7D32] bg-[#F4FBF4] shadow-sm' : 'border-gray-200 bg-white shadow-sm'}`} onClick={() => setMethod(title)}>
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${method === title ? 'bg-[#2E7D32] text-white' : 'bg-gray-50 border border-gray-100 text-gray-500'}`}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="flex-1 flex flex-col">
                <b className="text-[14px] font-bold text-[#0A3D0A] mb-1 tracking-[-0.01em]">{title}</b>
                <span className="text-[11px] font-medium text-gray-500 leading-snug">{copy}</span>
              </div>
              <div>
                {method === title ? <CheckCircle2 size={24} className="text-[#2E7D32]" /> : <div className="w-6 h-6 rounded-full border-[2.5px] border-gray-200"></div>}
              </div>
            </button>
          ))}
        </div>
      </section>
      
      <aside className="bg-[#E8F5E9] border border-[#C8E6C9] p-4 rounded-[20px] flex gap-3 mt-6 items-start shadow-sm">
        <ShieldCheck size={20} className="text-[#2E7D32] shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex flex-col">
          <b className="text-[13px] text-[#1B3A1B]">100% Secure Transaction</b>
          <small className="text-[11px] font-medium text-[#4A6B4A] mt-1 leading-snug">Your payment is protected by Seva Guarantee. Funds are released to experts only after service completion.</small>
        </div>
      </aside>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 bg-white border-t border-gray-100 flex items-center justify-between z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col">
          <small className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Total to Pay</small>
          <b className="text-[20px] font-bold text-[#0A3D0A]">Rs. 494</b>
        </div>
        <button className="bg-[#FF7A00] text-white flex items-center gap-2 h-14 px-7 rounded-[16px] text-[15px] font-bold shadow-[0_8px_16px_rgba(255,111,0,0.25)] active:scale-95 transition-transform" onClick={() => navigate('confirmed')}>
          Pay & Book Now <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </footer>
    </div>
  );
}

export function BookingConfirmed({ navigate }) { 
  return (
    <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center pt-10 px-5 pb-12 text-center font-['Inter',sans-serif]">
      <div className="w-[220px] h-[220px] mb-6 bg-[#E8F5E9] rounded-[40px] shadow-sm overflow-hidden border border-[#C8E6C9] flex items-center justify-center">
         <img src={confirmedBg} alt="Confirmed" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
      </div>
      
      <h1 className="text-[28px] font-bold text-[#0A3D0A] mb-3 tracking-[-0.02em]">Booking Confirmed!</h1>
      <p className="text-[14px] font-medium text-gray-500 mb-10 max-w-[260px] leading-relaxed">Your service request has been successfully placed with our expert.</p>
      
      <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-10 text-left">
        <div className="bg-[#F4FBF4] p-5 flex justify-between items-center border-b border-[#E8F5E9]">
          <div className="flex flex-col gap-1">
            <small className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Booking ID</small>
            <b className="text-[#2E7D32] text-[15px] tracking-wide">#SEVA12345</b>
          </div>
          <div className="flex gap-4 text-[#2E7D32]">
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95">
              <Download size={18} strokeWidth={2.5} />
            </button>
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95">
              <Share2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-[16px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0 border border-[#C8E6C9]">
            <ShieldCheck size={28} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <b className="text-[15px] font-bold text-[#0A3D0A] mb-1 tracking-[-0.01em]">Professional Plumbing Service</b>
            <span className="text-[12px] font-medium text-gray-500">Expert: <span className="font-bold text-[#0A3D0A]">Rajesh Kumar</span></span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 gap-y-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays size={16} strokeWidth={2.5} />
              <small className="text-[11px] font-bold uppercase tracking-wider">Date</small>
            </div>
            <b className="text-[13px] text-[#0A3D0A]">Tomorrow, 24 Oct 2026</b>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock3 size={16} strokeWidth={2.5} />
              <small className="text-[11px] font-bold uppercase tracking-wider">Time</small>
            </div>
            <b className="text-[13px] text-[#0A3D0A]">10:00 AM - 11:00 AM</b>
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} strokeWidth={2.5} />
              <small className="text-[11px] font-bold uppercase tracking-wider">Service Location</small>
            </div>
            <b className="text-[13px] text-[#0A3D0A] leading-snug">Villa 4B, Emerald Gardens, Kakkanad, Kochi</b>
          </div>
        </div>

        <div className="bg-[#FAFAFA] p-4 flex justify-between items-center">
          <span className="text-[11px] font-medium text-gray-500 italic">Professional will contact you soon</span>
          <span className="bg-[#2E7D32] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 size={12} strokeWidth={3} /> ACTIVE
          </span>
        </div>
      </div>
      
      <div className="w-full flex flex-col gap-4 mt-auto">
        <button className="w-full h-14 bg-[#FF7A00] text-white rounded-[16px] text-[15px] font-bold flex justify-center items-center gap-2 shadow-[0_8px_16px_rgba(255,111,0,0.25)] active:scale-95 transition-transform" onClick={() => navigate('requests')}>
          View My Bookings <ArrowRight size={20} strokeWidth={2.5} />
        </button>
        <button className="w-full h-14 bg-white text-[#2E7D32] border-[2px] border-[#2E7D32] rounded-[16px] text-[15px] font-bold active:bg-[#2E7D32] active:text-white transition-colors" onClick={() => navigate('home')}>
          Back to Home
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[#2E7D32] text-[10px] font-bold tracking-widest uppercase bg-[#E8F5E9] px-5 py-2.5 rounded-full border border-[#C8E6C9]">
        <ShieldCheck size={16} strokeWidth={2.5} /> SECURE MARKETPLACE GUARANTEE
      </div>
    </div>
  );
}
