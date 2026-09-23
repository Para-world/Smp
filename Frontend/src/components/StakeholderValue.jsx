import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, hoverElevate } from '../utils/animations';

const stakeholders = [
  { icon: 'person', title: 'For Students', quote: '\u201CStay organized, track your academic progress, and never miss an assignment deadline or exam alert.\u201D', metric: '98% Student Satisfaction' },
  { icon: 'history_edu', title: 'For Teachers', quote: '\u201CSpend less time on manual paperwork and grading, and more time mentoring the next generation.\u201D', metric: '7.5 hrs/week saved per educator' },
  { icon: 'manage_accounts', title: 'For Administrators', quote: '\u201CGain 360° visibility into institutional health, enrollments, tuition billing, and legal compliance.\u201D', metric: '100% Audit Readiness' },
  { icon: 'analytics', title: 'For Campus Boards', quote: '\u201CMake data-backed capital and curricular decisions with real-time academic intelligence.\u201D', metric: 'Predictive Enrollment AI' },
];

export default function StakeholderValue() {
  return (
    <section className="py-24 bg-surface-container-low dark:bg-[#0B1120] px-margin lg:px-margin-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Holistic Impact</span>
          <h2 className="font-display text-headline-lg text-slate-900 dark:text-white mt-2 font-bold tracking-tight transition-colors">Built for everyone in your institution</h2>
          <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">Every persona gains dedicated tools engineered to remove friction and heighten focus.</p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-sm"
        >
          {stakeholders.map((s) => (
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={hoverElevate}
              key={s.title} 
              className="p-6 rounded-2xl bg-white dark:bg-[#050811] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col justify-between cursor-pointer transition-colors duration-300"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-cyan-900/30 text-secondary dark:text-cyan-400 flex items-center justify-center mb-4 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                </div>
                <h3 className="font-display text-headline-sm text-slate-900 dark:text-white font-bold transition-colors">{s.title}</h3>
                <blockquote className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 italic mt-3 transition-colors">{s.quote}</blockquote>
              </div>
              <p className="text-label-xs font-semibold text-secondary dark:text-cyan-400 pt-4 transition-colors">{s.metric}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
