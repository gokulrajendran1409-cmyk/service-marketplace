import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, BookOpen, CreditCard, Wrench, User, Smartphone, HeadphonesIcon, 
  ChevronDown, ChevronUp, Mail, MessageSquare, Phone, Send, AlertTriangle, 
  ShieldAlert, UserX, Bug
} from "lucide-react";

const faqs = [
  { question: "How do I book a service?", answer: "Search for a service or category on our homepage. Browse through the available professionals, compare prices and reviews, and click 'Book Now'. Choose a date and time that works for you." },
  { question: "How do I cancel my booking?", answer: "Go to your Customer Dashboard, find the booking under 'Upcoming Services', and click 'Cancel'. Please note that cancellations made within 2 hours of the scheduled time may incur a small fee." },
  { question: "How do I pay?", answer: "We support secure online payments via Credit/Debit Cards, UPI, and Net Banking. Payment is held securely and only released to the professional after the job is successfully completed." },
  { question: "How are professionals verified?", answer: "Every professional goes through a rigorous 5-step process: application review, identity document verification, background check, skill assessment, and final approval before being listed." },
  { question: "What if the professional doesn't arrive?", answer: "In the rare event a professional doesn't show up, you can instantly report the issue from your dashboard. We will either arrange a replacement immediately or issue a full refund." },
  { question: "How do I become a professional?", answer: "Click 'Become a Pro' in the navbar or go to the registration page. Fill out your details, submit your documents, and our team will review your application within 24-48 hours." },
  { question: "How do refunds work?", answer: "If a job is canceled or disputed and a refund is approved, the amount will be credited back to your original payment method within 5-7 business days." },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  return (
    <main className="bg-slate-50 pt-28 pb-20 sm:pt-32">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-emerald-700 py-20 text-white text-center">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-600/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-emerald-800/50 blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Need Help? We're Here for You.
          </h1>
          <p className="mt-4 text-lg text-emerald-100">
            Find answers, contact support, or report an issue.
          </p>
          
          <div className="mt-10 mx-auto max-w-2xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="w-full rounded-full bg-white py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-xl"
              placeholder="Search for help... (e.g., 'How do I book a service?')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. Quick Help Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/help" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><BookOpen size={24} /></div>
            <span className="font-semibold text-slate-900">Booking Help</span>
          </Link>
          <Link to="/help" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CreditCard size={24} /></div>
            <span className="font-semibold text-slate-900">Payments & Refunds</span>
          </Link>
          <Link to="/help" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Wrench size={24} /></div>
            <span className="font-semibold text-slate-900">Professional Support</span>
          </Link>
          <Link to="/help" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><User size={24} /></div>
            <span className="font-semibold text-slate-900">Account & Login</span>
          </Link>
          <Link to="/help" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><Smartphone size={24} /></div>
            <span className="font-semibold text-slate-900">Technical Issues</span>
          </Link>
          <a href="#contact" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><HeadphonesIcon size={24} /></div>
            <span className="font-semibold text-slate-900">Contact Support</span>
          </a>
        </div>
      </section>

      {/* 3. Frequently Asked Questions */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-950 mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex items-center justify-between font-semibold text-slate-900 hover:bg-slate-50 transition text-left"
              >
                {faq.question}
                {openFaqIndex === index ? <ChevronUp size={20} className="text-emerald-700 shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
              </button>
              {openFaqIndex === index && (
                <div className="px-6 pb-5 text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Contact Support */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-950 mb-4">Contact Support</h2>
        <p className="text-center text-slate-600 mb-10">Can't find what you're looking for? Reach out to our team.</p>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="rounded-[32px] bg-white p-8 text-center border border-slate-200 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-4"><Mail size={24} /></div>
            <h3 className="font-bold text-slate-900 text-lg">Email Support</h3>
            <p className="mt-2 text-sm text-slate-500 mb-4">Get a response within 24 hours.</p>
            <a href="mailto:support@servora.com" className="text-emerald-700 font-semibold hover:underline">support@servora.com</a>
          </div>
          <div className="rounded-[32px] bg-white p-8 text-center border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-3 right-3 bg-slate-100 text-xs font-bold px-2 py-1 rounded text-slate-500">Coming Soon</div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 mb-4 opacity-50 group-hover:opacity-100 transition"><MessageSquare size={24} /></div>
            <h3 className="font-bold text-slate-900 text-lg">Live Chat</h3>
            <p className="mt-2 text-sm text-slate-500 mb-4">Chat with our support agents instantly.</p>
            <span className="text-slate-400 font-semibold cursor-not-allowed">Start Chat</span>
          </div>
          <div className="rounded-[32px] bg-white p-8 text-center border border-slate-200 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-4"><Phone size={24} /></div>
            <h3 className="font-bold text-slate-900 text-lg">Call Support</h3>
            <p className="mt-2 text-sm text-slate-500 mb-4">Available Mon-Sat, 9 AM - 6 PM.</p>
            <a href="tel:+9118001234567" className="text-emerald-700 font-semibold hover:underline">1800 123 4567</a>
          </div>
        </div>

        {/* Submit a Ticket Form */}
        <div className="max-w-2xl mx-auto rounded-[32px] bg-white p-8 border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Send size={24} className="text-emerald-700"/> Submit a Ticket</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Describe your issue..."></textarea>
            </div>
            <button type="submit" className="w-full rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* 5. Report a Problem */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-950 mb-10">Report a Problem</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex flex-col items-center p-6 text-center rounded-2xl bg-slate-100 hover:bg-slate-200 transition">
            <AlertTriangle size={32} className="text-amber-600 mb-3" />
            <span className="font-semibold text-slate-900">Booking Issue</span>
          </button>
          <button className="flex flex-col items-center p-6 text-center rounded-2xl bg-slate-100 hover:bg-slate-200 transition">
            <ShieldAlert size={32} className="text-blue-600 mb-3" />
            <span className="font-semibold text-slate-900">Payment Issue</span>
          </button>
          <button className="flex flex-col items-center p-6 text-center rounded-2xl bg-slate-100 hover:bg-slate-200 transition">
            <UserX size={32} className="text-rose-600 mb-3" />
            <span className="font-semibold text-slate-900">Report Professional</span>
          </button>
          <button className="flex flex-col items-center p-6 text-center rounded-2xl bg-slate-100 hover:bg-slate-200 transition">
            <Bug size={32} className="text-indigo-600 mb-3" />
            <span className="font-semibold text-slate-900">Report App Bug</span>
          </button>
        </div>
      </section>

      {/* 6. Emergency Help */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-rose-50 border border-rose-100 p-8 md:p-12 text-center text-rose-950 shadow-sm">
          <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-2xl font-extrabold sm:text-3xl">Need immediate assistance?</h2>
          <p className="mt-2 text-rose-700">For urgent service issues or safety concerns.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+9118001234567" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-8 py-3 font-semibold text-white transition hover:bg-rose-700">
              <Phone size={18} /> Call Support
            </a>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-rose-200 px-8 py-3 font-semibold text-rose-700 transition hover:bg-rose-100 opacity-50 cursor-not-allowed">
              <MessageSquare size={18} /> Open Live Chat (Soon)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
