import { Search, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <main className="bg-slate-50 pt-28 pb-20 sm:pt-32 min-h-screen flex flex-col items-center justify-center">
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700 font-semibold">Simple Process</p>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-950 sm:text-5xl">How it makes it easy</h1>
            <p className="mt-6 text-lg text-slate-600">Get your tasks done in three simple steps without any hassle.</p>
          </div>

          <div className="relative grid gap-8 lg:grid-cols-3">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-emerald-200/50 -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 group">
              <div className="flex flex-col items-center text-center rounded-[32px] bg-white p-8 shadow-sm transition duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 shadow-inner relative">
                  <Search size={32} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center border-4 border-white">1</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Find a Service</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">Search for the service you need or browse our categories. Read reviews and compare prices upfront.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 group">
              <div className="flex flex-col items-center text-center rounded-[32px] bg-white p-8 shadow-sm transition duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-6 shadow-inner relative">
                  <Star size={32} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center border-4 border-white">2</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Book a Pro</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">Select a trusted, verified professional that fits your schedule. Confirm your booking instantly.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 group">
              <div className="flex flex-col items-center text-center rounded-[32px] bg-white p-8 shadow-sm transition duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mb-6 shadow-inner relative">
                  <CheckCircle size={32} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center border-4 border-white">3</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Relax & Pay</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">The professional gets the job done. Release payment securely only after you are completely satisfied.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/services" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-800 hover:shadow-xl hover:-translate-y-0.5">
              Find Services Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
