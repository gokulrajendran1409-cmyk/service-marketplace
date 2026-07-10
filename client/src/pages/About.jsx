import { ArrowRight, Target, Eye, Heart, ShieldCheck, FileCheck, SearchCheck, CheckCircle2, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="bg-slate-50 pt-28 pb-20 sm:pt-32">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-emerald-50 py-20 lg:py-24">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
                Connecting People with <span className="text-emerald-700">Trusted Professionals</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Servora makes it simple, safe, and fast to find verified professionals for your everyday service needs.
              </p>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800" 
                  alt="Professionals and customers" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Our Story */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-700 font-semibold">Our Story</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-950">Why we built Servora</h2>
          <div className="mt-8 space-y-6 text-lg text-slate-600 leading-relaxed text-left bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-100">
            <p>
              Finding a trustworthy professional shouldn't depend on luck or personal contacts. Before Servora, people had to rely on random Google searches or wait days for a recommendation from a neighbor.
            </p>
            <p>
              Small service providers struggled to find consistent customers despite being highly skilled. The gap between those who needed help and those who could provide it was too wide.
            </p>
            <p className="font-medium text-slate-800">
              We built Servora to make hiring skilled professionals transparent, reliable, and accessible for everyone. We believe in empowering local professionals while giving customers absolute peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Our Mission, Vision, Values */}
      <section className="bg-slate-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-[32px] bg-slate-900 border border-slate-800 p-8 text-center text-white transition hover:-translate-y-1">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold">Our Mission</h3>
              <p className="mt-4 text-slate-400">Make professional services accessible, reliable, and safe for everyone.</p>
            </div>
            
            <div className="rounded-[32px] bg-slate-900 border border-slate-800 p-8 text-center text-white transition hover:-translate-y-1">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 mb-6">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold">Our Vision</h3>
              <p className="mt-4 text-slate-400">To become India's most trusted and widely used service marketplace.</p>
            </div>

            <div className="rounded-[32px] bg-slate-900 border border-slate-800 p-8 text-center text-white transition hover:-translate-y-1">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-bold">Our Values</h3>
              <p className="mt-4 text-slate-400">Trust, uncompromised Quality, total Transparency, and Customer First.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Servora */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-950">Why Choose Servora</h2>
          <p className="mt-4 text-slate-600">The numbers speak for themselves.</p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-emerald-700">10,000+</p>
            <p className="mt-3 font-medium text-slate-900">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-extrabold text-emerald-700">2,500+</p>
            <p className="mt-3 font-medium text-slate-900">Verified Professionals</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-extrabold text-emerald-700">50+</p>
            <p className="mt-3 font-medium text-slate-900">Service Categories</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-extrabold text-emerald-700 flex items-center justify-center gap-2">
              4.9 <span className="text-amber-400">★</span>
            </p>
            <p className="mt-3 font-medium text-slate-900">Average Rating</p>
          </div>
        </div>
      </section>

      {/* 5. How We Verify Professionals */}
      <section className="bg-emerald-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-950">How We Verify Professionals</h2>
            <p className="mt-4 text-slate-600">Your safety is our priority. Every pro goes through a strict screening process.</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-emerald-200 -translate-y-1/2"></div>
            
            <div className="grid gap-8 md:grid-cols-5 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
                  <Users size={24} />
                </div>
                <p className="font-semibold text-slate-900">Application</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
                  <FileCheck size={24} />
                </div>
                <p className="font-semibold text-slate-900">Document Verification</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
                  <SearchCheck size={24} />
                </div>
                <p className="font-semibold text-slate-900">Background Check</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <p className="font-semibold text-slate-900">Approval</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-700 border-4 border-emerald-200 flex items-center justify-center text-white mb-4 shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-semibold text-slate-900">Listed on Servora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Meet Our Team (Placeholder) */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-950">Meet Our Team</h2>
          <p className="mt-4 text-slate-600">The people working hard to make your life easier.</p>
        </div>
        
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 overflow-hidden mb-4">
              <img src="https://ui-avatars.com/api/?name=Founder&background=047857&color=fff&size=256" alt="Founder" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Gokul</h3>
            <p className="text-emerald-700 font-medium">Founder & CEO</p>
          </div>
        </div>
      </section>

      {/* 7. Contact CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-slate-900 p-10 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Have questions or want to partner with us?</h2>
          <p className="mt-4 text-lg text-slate-400">Our support team is always ready to help you out.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:contact@servora.com" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 font-semibold text-white transition hover:bg-emerald-500">
              Contact Us
            </a>
            <Link to="/professional/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition hover:bg-slate-100">
              Become a Professional <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
