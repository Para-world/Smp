import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleIn } from '../utils/animations';

export default function CTABanner() {
  return (
    <section className="pb-24 pt-10 px-margin lg:px-margin-lg" id="get-started">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
          className="p-10 md:p-16 rounded-[2.5rem] bg-[#050811] border border-slate-800 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center text-center group"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/10 pointer-events-none"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-700"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-400/30 transition-colors duration-700"></div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" className="flex flex-col items-center w-full relative z-10">
            <motion.span variants={fadeInUp} className="px-3.5 py-1 rounded-full bg-secondary text-on-secondary text-label-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
              Accelerate Your Academic Journey
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-display text-white max-w-2xl font-bold leading-tight tracking-tight">
              Ready to modernize your student management?
            </motion.h2>
            <motion.p variants={fadeInUp} className="font-body-lg text-body-lg text-slate-400 max-w-xl mt-4 mb-8 leading-relaxed">
              Join over 250+ progressive universities, institutes, and colleges transforming their administrative operations today.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(56,189,248,0.3)" }} whileTap={{ scale: 0.95 }} className="px-8 py-4 rounded-xl bg-gradient-to-r from-secondary to-blue-500 text-white font-label-md text-label-md font-bold shadow-lg transition-all" href="#signup">
                Get Started Free →
              </motion.a>
              <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-7 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-label-md text-label-md font-semibold backdrop-blur-md hover:bg-white/10 hover:text-white transition-all" href="#book-demo">
                Schedule a Campus Demo
              </motion.a>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 text-label-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span> 14-day full pilot license
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">support_agent</span> Dedicated onboarding advisor
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">sync</span> Free data migration assistance
            </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
