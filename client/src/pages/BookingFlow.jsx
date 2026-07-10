import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, MapPin, FileText, UploadCloud, ChevronRight, 
  ChevronLeft, CreditCard, Banknote, ShieldCheck, CheckCircle2,
  Phone, Navigation, AlertCircle, Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Mock professional data
const mockPro = {
  id: "p1",
  name: "Arun Kumar",
  role: "Electrician",
  price: 299,
  image: "https://ui-avatars.com/api/?name=Arun+Kumar&background=047857&color=fff&size=256"
};

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [photos, setPhotos] = useState([]);
  
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    houseName: "",
    street: "",
    city: "",
    district: "",
    pincode: "",
    contactNumber: user?.phone || "",
    problem: "",
    specialInstructions: "",
    paymentMethod: ""
  });

  // Calculate pricing
  const visitCharge = mockPro.price;
  const platformFee = 49;
  // Mock estimated cost range based on service
  const minEstimated = 800;
  const maxEstimated = 1200;
  const totalMin = visitCharge + platformFee + minEstimated;
  const totalMax = visitCharge + platformFee + maxEstimated;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleConfirm = () => {
    setLoading(true);
    // Simulate API call without changing database
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      window.scrollTo(0, 0);
    }, 1500);
  };

  const handleLocationToggle = () => {
    const toggled = !useCurrentLocation;
    setUseCurrentLocation(toggled);
    if (toggled) {
      setFormData(prev => ({
        ...prev,
        houseName: "Current Location",
        street: "Auto-detected street",
        city: "Auto-detected city",
        district: "Auto-detected district",
        pincode: "000000"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        houseName: "",
        street: "",
        city: "",
        district: "",
        pincode: ""
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (photos.length >= 5) return;
      const newPhotos = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos].slice(0, 5));
    }
  };

  const removePhoto = (index) => {
    const updated = [...photos];
    updated.splice(index, 1);
    setPhotos(updated);
  };

  const isStep1Valid = 
    formData.date && 
    formData.time && 
    formData.problem && 
    formData.contactNumber &&
    formData.houseName && 
    formData.city;

  return (
    <main className="bg-slate-50 pt-28 pb-20 sm:pt-32 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar */}
        <div className="mb-10 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
            <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600 transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span className={step >= 1 ? "text-emerald-700" : ""}>Details</span>
            <span className={step >= 2 ? "text-emerald-700" : ""}>Summary</span>
            <span className={step >= 3 ? "text-emerald-700" : ""}>Payment</span>
            <span className={step >= 4 ? "text-emerald-700" : ""}>Done</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-[36px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10">
          
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-extrabold text-slate-950 mb-2">Booking Details</h1>
              <p className="text-slate-500 mb-8">Please provide the service details below.</p>
              
              {/* Auto-filled Service/Pro */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500">Service</p>
                  <p className="font-bold text-slate-900">{mockPro.role}</p>
                </div>
                <div className="flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-4">
                  <p className="text-sm font-semibold text-slate-500">Professional</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={mockPro.image} alt="Pro" className="w-6 h-6 rounded-full" />
                    <p className="font-bold text-slate-900">{mockPro.name}</p>
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid gap-6 sm:grid-cols-2 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={16} className="text-emerald-600" /> Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Clock size={16} className="text-emerald-600" /> Preferred Time</label>
                  <select 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Choose a slot...</option>
                    <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
                    <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                    <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Service Address */}
              <div className="mb-8 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" /> Service Address
                  </label>
                  <button 
                    onClick={handleLocationToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${useCurrentLocation ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    <Navigation size={12} /> {useCurrentLocation ? "Using Current Location" : "Use Current Location"}
                  </button>
                </div>

                {!useCurrentLocation && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="text" placeholder="House Name / Flat No." value={formData.houseName} onChange={e => setFormData({...formData, houseName: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500" />
                    <input type="text" placeholder="Street / Area" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500" />
                    <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500" />
                    <input type="text" placeholder="District" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500" />
                    <input type="text" placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 sm:col-span-2" />
                  </div>
                )}
                {useCurrentLocation && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3 text-emerald-800">
                    <MapPin className="shrink-0 mt-0.5" size={18} />
                    <span className="text-sm">Location auto-detected. The professional will navigate to your current coordinates.</span>
                  </div>
                )}
              </div>

              {/* Problem Description */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16} className="text-emerald-600" /> Problem Description</label>
                <textarea 
                  rows="4" 
                  value={formData.problem}
                  onChange={(e) => setFormData({...formData, problem: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="Example: The living room fan is not working. It makes a buzzing sound." 
                />
              </div>

              {/* Upload Photos */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><UploadCloud size={16} className="text-emerald-600" /> Upload Photos (Optional, Max 5)</label>
                <div className="flex gap-4 flex-wrap">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                      <img src={photo} alt="Uploaded preview" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition text-slate-500">
                      <UploadCloud size={24} />
                      <span className="text-[10px] font-bold mt-1">Upload</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Contact & Instructions */}
              <div className="grid gap-6 sm:grid-cols-2 mb-10">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Phone size={16} className="text-emerald-600" /> Contact Number</label>
                  <input 
                    type="text" 
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><AlertCircle size={16} className="text-emerald-600" /> Special Instructions (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    placeholder="e.g. Please call before arriving."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button 
                  onClick={handleNext} 
                  disabled={!isStep1Valid}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Summary */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-extrabold text-slate-950 mb-2">Booking Summary</h1>
              <p className="text-slate-500 mb-8">Review your booking details before proceeding.</p>
              
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  {/* Service & Contact Info */}
                  <div className="rounded-3xl border border-slate-200 p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Service Details</h3>
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-slate-500">Date</span>
                        <span className="font-semibold text-slate-900">{formData.date}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-slate-500">Time</span>
                        <span className="font-semibold text-slate-900">{formData.time}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-slate-500">Address</span>
                        <span className="font-semibold text-slate-900">{useCurrentLocation ? "Current Location (Auto-detected)" : `${formData.houseName}, ${formData.street}, ${formData.city}`}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-slate-500">Contact</span>
                        <span className="font-semibold text-slate-900">{formData.contactNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Problem & Instructions</h3>
                    <p className="text-sm font-medium text-slate-900 mb-4">{formData.problem}</p>
                    {formData.specialInstructions && (
                      <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 border border-amber-100">
                        <strong>Note:</strong> {formData.specialInstructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <div className="rounded-3xl border border-slate-200 p-6 sm:p-8 bg-slate-950 text-white shadow-xl sticky top-24">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Banknote className="text-emerald-400" /> Estimated Price</h3>
                    
                    <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Visit Charge</span>
                        <span className="font-semibold">₹{visitCharge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Cost (Parts/Labor)</span>
                        <span className="font-semibold text-slate-300">₹{minEstimated} – ₹{maxEstimated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Platform Fee</span>
                        <span className="font-semibold">₹{platformFee}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Estimated Total</p>
                        <p className="text-3xl font-extrabold text-emerald-400">₹{totalMin}+</p>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs text-slate-400 bg-slate-900 p-4 rounded-2xl mb-8">
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                      <p>Final price will be confirmed by the professional after inspection.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button onClick={handleNext} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 font-bold text-white transition hover:bg-emerald-500">
                        Proceed to Payment <ChevronRight size={20} />
                      </button>
                      <button onClick={handleBack} className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-transparent px-8 py-3.5 font-semibold text-slate-300 transition hover:bg-slate-800">
                        Back to Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-extrabold text-slate-950 mb-2">Payment Method</h1>
              <p className="text-slate-500 mb-8">Choose how you'd like to pay for the service.</p>

              <div className="space-y-4 mb-10 max-w-2xl">
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-5 transition ${formData.paymentMethod === 'UPI' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${formData.paymentMethod === 'UPI' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <CreditCard size={20} />
                    </div>
                    <span className="font-bold text-slate-900">UPI</span>
                  </div>
                  <input type="radio" name="payment" value="UPI" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="h-5 w-5 accent-emerald-600" />
                </label>

                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-5 transition ${formData.paymentMethod === 'Card' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${formData.paymentMethod === 'Card' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <CreditCard size={20} />
                    </div>
                    <span className="font-bold text-slate-900">Credit / Debit Card</span>
                  </div>
                  <input type="radio" name="payment" value="Card" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="h-5 w-5 accent-emerald-600" />
                </label>
                
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-5 transition ${formData.paymentMethod === 'NetBanking' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${formData.paymentMethod === 'NetBanking' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Banknote size={20} />
                    </div>
                    <span className="font-bold text-slate-900">Net Banking</span>
                  </div>
                  <input type="radio" name="payment" value="NetBanking" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="h-5 w-5 accent-emerald-600" />
                </label>

                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-5 transition ${formData.paymentMethod === 'Cash' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${formData.paymentMethod === 'Cash' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Cash After Service</p>
                      <p className="text-xs text-slate-500">Pay the professional directly after completion.</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="Cash" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="h-5 w-5 accent-emerald-600" />
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100 max-w-2xl">
                <button onClick={handleBack} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                  <ChevronLeft size={20} /> Back
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={!formData.paymentMethod || loading}
                  className="inline-flex items-center justify-center min-w-[200px] gap-2 rounded-full bg-emerald-700 px-10 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-70 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {loading ? "Processing..." : "Book Now"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && (
            <div className="animate-in zoom-in-95 duration-500 text-center py-10 max-w-2xl mx-auto">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-950 mb-4">Booking Confirmed!</h1>
              
              <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left border border-slate-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Booking ID</p>
                    <p className="font-bold text-xl text-slate-900">#BKG-84920</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-500">Status</p>
                    <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1">Pending</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr]">
                    <span className="text-sm font-semibold text-slate-500">Professional</span>
                    <span className="text-sm font-bold text-slate-900">{mockPro.name} ({mockPro.role})</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <span className="text-sm font-semibold text-slate-500">Date & Time</span>
                    <span className="text-sm font-bold text-slate-900">{formData.date} | {formData.time}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <span className="text-sm font-semibold text-slate-500">Address</span>
                    <span className="text-sm font-bold text-slate-900">{useCurrentLocation ? "Current Location" : `${formData.houseName}, ${formData.city}`}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <span className="text-sm font-semibold text-slate-500">Arrival Est.</span>
                    <span className="text-sm font-bold text-emerald-700">Awaiting Pro Confirmation</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/customer/dashboard" className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800">
                  Track Booking
                </Link>
                <button className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50">
                  Chat
                </button>
                <button className="flex-1 inline-flex items-center justify-center rounded-full bg-rose-50 text-rose-600 px-6 py-3.5 font-bold transition hover:bg-rose-100">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
