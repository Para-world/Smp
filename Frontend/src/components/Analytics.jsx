import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, slideInLeft, slideInRight } from '../utils/animations';

export default function Analytics() {
  return (
    <section className="py-24 bg-[#050811] text-white px-margin lg:px-margin-lg relative overflow-hidden" id="analytics">
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center overflow-hidden">
          <motion.div 
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-5 flex flex-col items-start gap-4"
          >
            <span className="px-3 py-1 rounded-full bg-blue-900/60 text-cyan-300 text-label-xs font-bold uppercase tracking-wider">Smart Predictive Analytics</span>
            <h2 className="font-display text-display font-bold leading-tight">Turn student data into actionable academic insights.</h2>
            <p className="font-body-lg text-body-lg text-slate-400">Detect academic drop-off risks early, monitor curriculum efficacy, and forecast enrollment trends before semesters begin with our proprietary retention intelligence engine.</p>
            <div className="pt-2 flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(56,189,248,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-3 rounded-lg bg-gradient-to-r from-secondary to-blue-500 text-white font-label-md text-label-md transition-all shadow-lg flex items-center gap-2 font-bold border border-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export Accreditation Report</span>
              </motion.button>
            </div>
          </motion.div>
          <motion.div 
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-7 flex flex-col gap-4"
          >
            {/* Retention Watchlist */}
            <div className="p-6 rounded-2xl bg-[#0B1120]/80 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center justify-between pb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[22px]">warning</span>
                  <span className="text-label-md font-bold text-white">Automated Retention Watchlist</span>
                </div>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold">Priority: High</span>
              </div>
              <p className="text-body-sm text-slate-300">
                <strong className="text-white">3 students flagged</strong> in{' '}
                <span className="text-cyan-300 font-semibold">MATH-204 Differential Equations</span>{' '}
                due to attendance dropping below 75% threshold in the last 14 days.
              </p>
              <div className="mt-4 flex items-center justify-between text-[11px] pt-3">
                <span className="text-slate-400">Action: Automated academic advisor intervention triggered.</span>
                <span className="text-cyan-400 hover:underline cursor-pointer font-semibold">View Case Files →</span>
              </div>
            </div>
            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#0B1120]/80 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between backdrop-blur-xl group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Campus Retention Rate</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-display text-headline-lg font-bold text-white">97.2%</span>
                    <span className="text-emerald-400 text-label-xs font-bold">↑ +2.1% vs National Avg</span>
                  </div>
                </div>
                <div className="pt-4">
                  <svg className="w-full h-12" fill="none" viewBox="0 0 160 40">
                    <path d="M0,35 Q40,30 80,18 T160,8" fill="none" stroke="#38bdf8" strokeWidth="2.5"></path>
                    <circle cx="160" cy="8" fill="#38bdf8" r="3"></circle>
                  </svg>
                  <span className="text-[10px] text-slate-400 block pt-1">4-Year Cohort Longevity</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B1120]/80 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between backdrop-blur-xl group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Curricular Efficacy Index</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-display text-headline-lg font-bold text-white">94.6</span>
                    <span className="text-cyan-400 text-label-xs font-bold">Top Decile</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>STEM Faculty</span>
                    <span className="font-bold">96.8%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '96.8%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="bg-cyan-400 h-1.5 rounded-full"
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300 pt-1">
                    <span>Humanities</span>
                    <span className="font-bold">92.4%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '92.4%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="bg-blue-500 h-1.5 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
