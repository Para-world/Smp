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
          className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-[#0A072E] text-on-primary shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" className="flex flex-col items-center w-full relative z-10">
            <motion.span variants={fadeInUp} className="px-3.5 py-1 rounded-full bg-secondary text-on-secondary text-label-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
              Accelerate Your Academic Journey
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-display text-white max-w-2xl font-bold leading-tight">
              Ready to modernize your student management?
            </motion.h2>
            <motion.p variants={fadeInUp} className="font-body-lg text-body-lg text-slate-300 max-w-xl mt-3 mb-8">
              Join over 250+ progressive universities, institutes, and colleges transforming their administrative operations today.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold shadow-lg hover:bg-secondary-container hover:shadow-xl transition-all" href="#signup">
                Get Started Free →
              </motion.a>
              <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-7 py-4 rounded-xl bg-white/10 text-white font-label-md text-label-md font-semibold backdrop-blur-md hover:bg-white/20 transition-all" href="#book-demo">
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
