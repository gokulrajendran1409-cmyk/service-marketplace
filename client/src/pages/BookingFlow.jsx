import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, MapPin, FileText, UploadCloud, ChevronRight, 
  ChevronLeft, CreditCard, Banknote, ShieldCheck, CheckCircle2 
} from "lucide-react";

// Mock professional data (would normally be fetched by id)
const mockPro = {
  id: "p1",
  name: "Arun Kumar",
  role: "Expert Plumber",
  price: 299,
  image: "https://ui-avatars.com/api/?name=Arun+Kumar&background=047857&color=fff&size=256"
};

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    address: "",
    problem: "",
    paymentMethod: ""
  });

  // Calculate pricing
  const visitCharge = mockPro.price;
  const taxes = Math.round(visitCharge * 0.18); // 18% GST
  const total = visitCharge + taxes;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1500);
  };

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
              <h1 className="text-3xl font-extrabold text-slate-950 mb-2">Service Details</h1>
              <p className="text-slate-500 mb-8">Tell us what you need and when you need it.</p>
              
              <div className="grid gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={16} className="text-emerald-600" /> Select Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Clock size={16} className="text-emerald-600" /> Select Time</label>
                  <select 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Choose a slot...</option>
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><MapPin size={16} className="text-emerald-600" /> Service Address</label>
                <textarea 
                  rows="2" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="Enter your full address..." 
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16} className="text-emerald-600" /> Problem Description</label>
                <textarea 
                  rows="3" 
                  value={formData.problem}
                  onChange={(e) => setFormData({...formData, problem: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="Describe the issue you are facing..." 
                />
              </div>

              <div className="mb-10">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><UploadCloud size={16} className="text-emerald-600" /> Upload Images (Optional)</label>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:bg-slate-50 transition cursor-pointer">
                  <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button 
                  onClick={handleNext} 
                  disabled={!formData.date || !formData.time || !formData.address || !formData.problem}
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
              <p className="text-slate-500 mb-8">Review your booking details before proceeding to payment.</p>
              
              <div className="rounded-3xl border border-slate-200 p-6 mb-8 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-4">Professional Details</h3>
                <div className="flex items-center gap-4">
                  <img src={mockPro.image} alt={mockPro.name} className="h-16 w-16 rounded-full bg-white border border-slate-200" />
                  <div>
                    <p className="font-bold text-lg text-slate-900">{mockPro.name}</p>
                    <p className="text-sm text-slate-600">{mockPro.role}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-6 mb-8">
                <h3 className="font-bold text-slate-900 mb-4">Service Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-4"><span className="text-slate-500 w-24 shrink-0">Date & Time</span><span className="font-medium text-slate-900">{formData.date} at {formData.time}</span></div>
                  <div className="flex gap-4"><span className="text-slate-500 w-24 shrink-0">Address</span><span className="font-medium text-slate-900">{formData.address}</span></div>
                  <div className="flex gap-4"><span className="text-slate-500 w-24 shrink-0">Problem</span><span className="font-medium text-slate-900">{formData.problem}</span></div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-6 mb-10 bg-emerald-50/50">
                <h3 className="font-bold text-slate-900 mb-4">Price Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Base Visit Charge</span><span className="font-medium text-slate-900">₹{visitCharge}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Taxes (18% GST)</span><span className="font-medium text-slate-900">₹{taxes}</span></div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between"><span className="font-bold text-lg text-slate-900">Total to Pay</span><span className="font-bold text-lg text-emerald-700">₹{total}</span></div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <ShieldCheck size={16} /> Final price may change if extra parts or extensive labor is required.
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={handleBack} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                  <ChevronLeft size={20} /> Back
                </button>
                <button onClick={handleNext} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 font-bold text-white transition hover:bg-emerald-800">
                  Proceed to Payment <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-extrabold text-slate-950 mb-2">Payment Method</h1>
              <p className="text-slate-500 mb-8">Choose how you'd like to pay for the service.</p>

              <div className="mb-8 p-6 bg-slate-950 text-white rounded-3xl flex justify-between items-center shadow-lg">
                <span className="text-slate-300 font-medium">Amount to Pay</span>
                <span className="text-3xl font-extrabold">₹{total}</span>
              </div>

              <div className="space-y-4 mb-10">
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-5 transition ${formData.paymentMethod === 'UPI' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${formData.paymentMethod === 'UPI' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <CreditCard size={20} />
                    </div>
                    <span className="font-bold text-slate-900">UPI / QR Code</span>
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

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={handleBack} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                  <ChevronLeft size={20} /> Back
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={!formData.paymentMethod || loading}
                  className="inline-flex items-center justify-center min-w-[160px] gap-2 rounded-full bg-emerald-700 px-8 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-70"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && (
            <div className="animate-in zoom-in-95 duration-500 text-center py-10">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-950 mb-4">Booking Confirmed!</h1>
              <p className="text-lg text-slate-600 max-w-lg mx-auto mb-8">
                Your booking ID is <span className="font-bold text-slate-900">#BKG-84920</span>. {mockPro.name} has been notified and will arrive on {formData.date} at {formData.time}.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/customer/dashboard" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-8 py-3.5 font-bold text-white transition hover:bg-emerald-800">
                  Track Booking
                </Link>
                <Link to="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
