import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, hoverElevate } from '../utils/animations';

const steps = [
  { num: '01', icon: 'account_tree', title: 'Configure Campus Hierarchy', desc: 'Establish your schools, colleges, academic faculties, grading curves, semester terms, and academic holidays in minutes.' },
  { num: '02', icon: 'upload_file', title: 'Bulk Import & Sync', desc: 'Ingest legacy CSV spreadsheets or auto-synchronize through your Active Directory, LDAP, or existing SIS APIs with zero downtime.' },
  { num: '03', icon: 'rocket_launch', title: 'Empower Your Campus', desc: 'Issue automated magic-link credentials to faculty, students, and staff. Monitor real-time campus operations with zero friction.' },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Fast Deployment</span>
          <h2 className="font-display text-headline-lg text-slate-900 dark:text-white mt-2 font-bold tracking-tight transition-colors">Get your institution online in three simple steps</h2>
          <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">Accelerate your digital transition without disrupting ongoing terms or active lectures.</p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-gutter-lg relative"
        >
          {steps.map((step) => (
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={hoverElevate}
              key={step.num} 
              className="p-8 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none flex flex-col items-start relative cursor-pointer transition-colors duration-300"
            >
              <span className="font-display text-display text-secondary/20 dark:text-secondary/10 font-extrabold mb-2 transition-colors">{step.num}</span>
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-secondary flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
              </div>
              <h3 className="font-display text-headline-sm text-slate-900 dark:text-white font-bold tracking-tight transition-colors">{step.title}</h3>
              <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
