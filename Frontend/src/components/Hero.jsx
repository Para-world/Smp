import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, slideInRight } from '../utils/animations';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-space-xl pb-28 px-margin lg:px-margin-lg">
      {/* Ambient backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] bg-gradient-to-tr from-secondary/20 via-blue-500/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-12 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center overflow-hidden">
          {/* Left Hero Copy */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 flex flex-col items-start gap-space-md"
          >
            {/* Release Tag */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container dark:bg-slate-800/50 border border-transparent dark:border-slate-700/50 text-on-surface dark:text-slate-300 shadow-sm text-label-xs font-semibold transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="tracking-wide uppercase">Smarter Student Management • v3.4 Released</span>
            </motion.div>
            {/* Main Heading */}
            <motion.h1 variants={fadeInUp} className="font-display text-display text-primary dark:text-white leading-[1.1] tracking-[-0.04em] transition-colors">
              Manage Your Entire{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-secondary via-blue-500 to-indigo-600 drop-shadow-sm">
                Student Journey
              </span>{' '}
              in One Place
            </motion.h1>
            {/* Supporting Text */}
            <motion.p variants={fadeInUp} className="font-body-lg text-body-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed transition-colors">
              From admissions and attendance to assignments, results, communication, and verified transcripts — manage your entire institution with one secure, enterprise-grade digital platform.
            </motion.p>
            {/* CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-space-md pt-2">
              <motion.a whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(56,189,248,0.3)" }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-secondary to-blue-500 text-white font-label-md text-label-md shadow-lg transition-all font-bold" href="#get-started">
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </motion.a>
              <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-label-md text-label-md hover:bg-white/80 dark:hover:bg-slate-800 hover:shadow-sm transition-all font-semibold" href="#product-cockpit">
                <span className="material-symbols-outlined text-secondary text-[20px]">play_circle</span>
                <span>Explore Platform</span>
              </motion.a>
              <motion.a whileHover={{ scale: 1.05 }} className="inline-flex items-center justify-center px-4 py-3.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors font-medium" href="#book-demo">
                Book Institutional Demo
              </motion.a>
            </motion.div>
            {/* Trust Micro-Banner */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-label-xs font-label-xs text-on-surface-variant dark:text-slate-400 transition-colors">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span> No credit card required
              </span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span> Setup in under 15 minutes
              </span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span> Built for modern accreditation
              </span>
            </motion.div>
          </motion.div>
          {/* Right Hero Mockup */}
          <motion.div 
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 relative mt-6 lg:mt-0"
          >
            {/* Glassmorphic Floating Pills */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-label-xs font-semibold transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold transition-colors">98.4% Attendance Verified</p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-normal transition-colors">Department of Engineering • Live</p>
              </div>
            </motion.div>
            <div className="absolute -bottom-6 -left-2 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-label-xs transition-colors">
              <span className="material-symbols-outlined text-secondary text-[20px]">assignment_turned_in</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white transition-colors">Assignment Submitted • CS-402</p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium transition-colors">Sarah Lin • 2m ago</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 z-20 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-cyan-900/40 backdrop-blur-md border border-slate-700 dark:border-cyan-500/30 text-white shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-label-xs font-semibold transition-colors">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Spring Term Registration Open</span>
            </div>
            {/* Main Dashboard Mockup Card */}
            <div className="w-full bg-white/60 dark:bg-[#0B1120]/60 backdrop-blur-3xl border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-5 overflow-hidden relative transition-colors">
              {/* Cockpit Topbar */}
              <div className="flex items-center justify-between pb-4 bg-surface-container-low/50 dark:bg-slate-900/50 -mx-5 -mt-5 px-5 pt-4 transition-colors border-b border-transparent dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span className="ml-2 font-label-xs text-label-xs text-on-surface-variant dark:text-slate-400 transition-colors">EduSphere Admin Console</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-label-xs bg-surface-container dark:bg-slate-800 px-2.5 py-1 rounded text-primary dark:text-slate-200 font-semibold transition-colors">Term: Fall 2026</span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant dark:text-slate-400 transition-colors">notifications</span>
                  <div className="w-6 h-6 rounded-full bg-primary dark:bg-slate-700 text-on-primary dark:text-white text-[10px] flex items-center justify-center font-bold transition-colors">DR</div>
                </div>
              </div>
              {/* KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 pb-4">
                {[
                  { label: 'Total Students', value: '24,850', trend: '↑ +12.4% YoY', trendColor: 'text-emerald-600' },
                  { label: 'Attendance', value: '94.8%', trend: 'Optimal', trendColor: 'text-emerald-600' },
                  { label: 'Active Courses', value: '184', trend: '8 Faculties', trendColor: 'text-on-surface-variant' },
                  { label: 'Pending Actions', value: '18', trend: 'Requires Review', trendColor: 'text-amber-600' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-surface-container-low dark:bg-slate-800/40 dark:border dark:border-slate-700/50 p-3 rounded-lg transition-colors">
                    <span className="font-label-xs text-label-xs text-on-surface-variant dark:text-slate-400 uppercase transition-colors">{kpi.label}</span>
                    <p className="font-headline-sm text-headline-sm text-primary dark:text-white font-bold mt-1 transition-colors">{kpi.value}</p>
                    <span className={`text-[11px] ${kpi.trendColor} font-semibold`}>{kpi.trend}</span>
                  </div>
                ))}
              </div>
              {/* Visual Inline Charts Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-7 bg-surface-container-low dark:bg-slate-800/40 dark:border dark:border-slate-700/50 p-3.5 rounded-lg flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-label-xs text-label-xs font-semibold text-primary dark:text-slate-200 transition-colors">Campus Attendance Weekly Flow</span>
                    <span className="text-label-xs text-secondary font-medium">96.2% Avg</span>
                  </div>
                  <div className="w-full pt-3">
                    <svg className="w-full h-20" fill="none" preserveAspectRatio="none" viewBox="0 0 240 60">
                      <path d="M0,45 Q30,20 60,35 T120,15 T180,25 T240,8 L240,60 L0,60 Z" fill="url(#gradHero)" opacity="0.4"></path>
                      <path d="M0,45 Q30,20 60,35 T120,15 T180,25 T240,8" fill="none" stroke="#0051d5" strokeWidth="2.5"></path>
                      <defs>
                        <linearGradient id="gradHero" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#0051d5"></stop>
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex justify-between text-[10px] text-on-surface-variant dark:text-slate-400 pt-1 transition-colors">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-5 bg-surface-container-low dark:bg-slate-800/40 dark:border dark:border-slate-700/50 p-3.5 rounded-lg flex flex-col justify-between transition-colors">
                  <span className="font-label-xs text-label-xs font-semibold text-primary dark:text-slate-200 transition-colors">Academic Standing</span>
                  <div className="flex items-center gap-3 py-1">
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" fill="none" r="15.915" stroke="#e2e8f0" strokeWidth="3.5"></circle>
                        <circle cx="18" cy="18" fill="none" r="15.915" stroke="#0051d5" strokeDasharray="88, 100" strokeLinecap="round" strokeWidth="3.5"></circle>
                      </svg>
                      <span className="absolute text-[11px] font-bold text-primary">88%</span>
                    </div>
                    <div className="flex flex-col text-[11px] leading-tight text-on-surface-variant dark:text-slate-400 transition-colors">
                      <span className="font-semibold text-primary dark:text-white transition-colors">Honors &amp; Above</span>
                      <span>Deans List: 1,420</span>
                      <span className="text-emerald-600 font-semibold">+3.8% this term</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant dark:text-slate-400 bg-surface-container-lowest dark:bg-slate-900/50 px-2 py-1 rounded transition-colors">
                    Status: 94.2% Passed Assessment
                  </div>
                </div>
              </div>
              {/* Activity List Row */}
              <div className="pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low/60 dark:bg-slate-800/40 dark:border dark:border-slate-700/30 text-label-xs transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">folder_shared</span>
                    <span className="font-medium text-primary dark:text-slate-200 transition-colors">CS-301 Midterm Gradebook Published</span>
                  </div>
                  <span className="text-on-surface-variant dark:text-slate-500 text-[11px] transition-colors">Just now</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
