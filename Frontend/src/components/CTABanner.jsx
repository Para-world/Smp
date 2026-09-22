export default function CTABanner() {
  return (
    <section className="pb-24 pt-10 px-margin lg:px-margin-lg" id="get-started">
      <div className="max-w-7xl mx-auto">
        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-[#0A072E] text-on-primary shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <span className="px-3.5 py-1 rounded-full bg-secondary text-on-secondary text-label-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            Accelerate Your Academic Journey
          </span>
          <h2 className="font-display text-display text-white max-w-2xl font-bold leading-tight">
            Ready to modernize your student management?
          </h2>
          <p className="font-body-lg text-body-lg text-slate-300 max-w-xl mt-3 mb-8">
            Join over 250+ progressive universities, institutes, and colleges transforming their administrative operations today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a className="px-8 py-4 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold shadow-lg hover:bg-secondary-container hover:shadow-xl transition-all transform hover:-translate-y-0.5" href="#signup">
              Get Started Free →
            </a>
            <a className="px-7 py-4 rounded-xl bg-white/10 text-white font-label-md text-label-md font-semibold backdrop-blur-md hover:bg-white/20 transition-all" href="#book-demo">
              Schedule a Campus Demo
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 text-label-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span> 14-day full pilot license
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">support_agent</span> Dedicated onboarding advisor
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">sync</span> Free data migration assistance
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
