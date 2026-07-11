import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, User, 
  MapPin, Briefcase, DollarSign, Calendar, FileText, Banknote, ShieldCheck, AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { registerProfessional } from "../api/auth";

export default function ProfessionalRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const createEmptyFormData = () => ({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    profession: "",
    experience: "",
    languages: "",
    bio: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    serviceArea: "",
    visitCharge: "",
    hourlyRate: "",
    emergencyCharge: "",
    workingHours: "",
    emergencyService: false,
    idProof: "",
    certificate: "",
    profilePhoto: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  });

  const createInitialFormData = () => ({
    ...createEmptyFormData()
  });

  // Form State
  const isUpgrade = Boolean(user && user.roles?.customer && !user.roles?.professional);

  const [formData, setFormData] = useState(() => ({
    ...createInitialFormData(),
    fullName: user?.full_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  }));

  useEffect(() => {
    setFormData({
      ...createInitialFormData(),
      fullName: user?.full_name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    });
    setStep(1);
    setError("");
    setSuccess(false);
    setLoading(false);
  }, [user?.full_name, user?.phone, user?.email]);

  const resetForm = () => {
    setFormData(createEmptyFormData());
    setStep(1);
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError("");
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.email || (!user && !formData.password)) {
      setError("Please fill in all required personal details (Step 1).");
      setStep(1);
      return;
    }
    if (!formData.profession) {
      setError("Please select a profession (Step 2).");
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const res = await registerProfessional(formData);
      if (res.success) {
        resetForm();
        setSuccess(true);
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("ProfessionalRegistration error:", err);
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/professional/login");
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-[36px] shadow-xl text-center max-w-lg border border-slate-100">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Application Submitted!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for registering. Your profile is currently <span className="font-bold text-amber-600">Pending Verification</span>. Our admin team will review your documents within 24-48 hours.
          </p>
          <p className="text-sm text-slate-500 mb-4">Redirecting you to the professional login page...</p>
          <Link 
            to="/professional/login" 
            className="inline-block w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white transition hover:bg-slate-800"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const steps = [
    { id: 1, title: "Personal" },
    { id: 2, title: "Professional" },
    { id: 3, title: "Address" },
    { id: 4, title: "Pricing" },
    { id: 5, title: "Documents" },
    { id: 6, title: "Bank Info" }
  ];

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl mb-4">Professional Registration</h1>
          
          {/* Progress Bar */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
              <div style={{ width: `${(step / 6) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600 transition-all duration-500"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {steps.map(s => (
                <span key={s.id} className={step >= s.id ? "text-emerald-700" : "hidden sm:inline"}>{s.title}</span>
              ))}
              <span className="sm:hidden text-emerald-700">Step {step} of 6</span>
            </div>
          </div>
        </div>

        <div className="rounded-[36px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10">
          
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {isUpgrade ? (
                  <p>
                    You are currently logged in as a customer. Complete this form to upgrade your existing account to a professional profile.
                  </p>
                ) : (
                  <p>
                    Register as a professional with your phone and password. If you are already a customer, please login first and then upgrade your account.
                  </p>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><User className="text-emerald-600" /> Personal Details</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="+91 XXXXXXXXXX" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="john@example.com" />
                </div>
                {!isUpgrade && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Create Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Minimum 6 characters" />
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Briefcase className="text-emerald-600" /> Professional Details</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Profession / Category</label>
                  <select name="profession" value={formData.profession} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">Select Category...</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC Technician">AC Technician</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Painter">Painter</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Photographer">Photographer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
                  <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 5" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Languages Known</label>
                  <input type="text" name="languages" value={formData.languages} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="English, Malayalam, Hindi" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Short Bio</label>
                  <textarea rows="3" name="bio" value={formData.bio} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="E.g. Certified electrician with 8 years of experience in residential wiring..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><MapPin className="text-emerald-600" /> Address & Service Area</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Kerala" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ernakulam" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Kochi" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="682001" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Service Area (Cities or Radius)</label>
                  <input type="text" name="serviceArea" value={formData.serviceArea} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="E.g. Kochi, Kakkanad, or 20km from current location" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><DollarSign className="text-emerald-600" /> Pricing & Availability</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Base Visit Charge (₹)</label>
                  <input type="number" name="visitCharge" value={formData.visitCharge} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="299" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate (₹) (Optional)</label>
                  <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Calendar className="text-emerald-600" size={16} /> Working Hours</label>
                  <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Mon-Sat, 9 AM - 6 PM" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50">
                  <input type="checkbox" name="emergencyService" checked={formData.emergencyService} onChange={handleChange} className="h-5 w-5 accent-emerald-600" id="emergency" />
                  <label htmlFor="emergency" className="text-sm font-bold text-emerald-900 cursor-pointer">I provide 24/7 Emergency Service</label>
                </div>
                {formData.emergencyService && (
                  <div className="sm:col-span-2 animate-in fade-in">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Visit Charge (₹)</label>
                    <input type="number" name="emergencyCharge" value={formData.emergencyCharge} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="599" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText className="text-emerald-600" /> Documents Upload</h2>
              <p className="text-sm text-slate-500 mb-6">Upload clear photos or PDFs for verification.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Government ID (Aadhaar / Driving Licence)</label>
                  <div className="flex items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <div className="text-center text-slate-500">
                      <UploadCloud className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-sm font-semibold">Click to upload ID Proof</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Photo (Professional headshot)</label>
                  <div className="flex items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <div className="text-center text-slate-500">
                      <User className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-sm font-semibold">Click to upload Photo</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio Photos (Optional, up to 5)</label>
                  <div className="flex items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <div className="text-center text-slate-500">
                      <UploadCloud className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-sm font-semibold">Upload Before/After photos of your work</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Bank Info */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Banknote className="text-emerald-600" /> Bank Details</h2>
              <p className="text-sm text-slate-500 mb-6">Where should we send your earnings?</p>
              
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Account Holder Name</label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Name exactly as on bank account" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                  <input type="password" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Enter Account Number" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                  <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase" placeholder="e.g. SBIN0001234" />
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100 flex gap-3 text-sm">
                <ShieldCheck className="shrink-0 h-5 w-5" />
                <p>Your bank details are encrypted and stored securely. Payouts are processed weekly.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <button 
              onClick={handleBack} 
              disabled={step === 1 || loading}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition ${step === 1 ? 'opacity-0 cursor-default' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <ChevronLeft size={20} /> Back
            </button>
            
            {step < 6 ? (
              <button 
                onClick={handleNext} 
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 font-bold text-white transition hover:bg-emerald-800"
              >
                Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-10 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-70 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-500">
                Already registered as a professional?{" "}
                <Link to="/professional/login" className="font-semibold text-emerald-700 hover:underline">
                  Log in
                </Link>
             </p>
          </div>

        </div>
      </div>
    </main>
  );
}
