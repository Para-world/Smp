import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, hoverElevate } from '../utils/animations';

const experiences = [
  {
    icon: 'school', badge: 'Self-Service Portal', title: 'Student Experience',
    desc: 'Empower learners with absolute transparency into their academic progress, timetable, and campus obligations.',
    features: [
      'Interactive live class timetable & room navigator',
      'Real-time GPA & credit completion barometer',
      'One-click digital assignment dropzone',
      'Virtual student identity pass with Apple/Google Wallet',
    ],
    preview: (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent dark:border-slate-700/30 mb-6 transition-colors">
        <div className="flex items-center justify-between text-label-xs">
          <span className="font-semibold text-slate-900 dark:text-white transition-colors">Next Class: Machine Learning</span>
          <span className="text-secondary font-bold">10:30 AM</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2">
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 transition-colors">Cumulative GPA</p>
            <p className="font-bold text-slate-900 dark:text-white text-headline-sm transition-colors">3.88 <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal transition-colors">/ 4.0</span></p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-label-xs font-semibold transition-colors">Dean&apos;s Honor</span>
        </div>
      </div>
    ),
    cta: 'Explore Student Portal', href: '#student-portal',
  },
  {
    icon: 'co_present', badge: 'Faculty Workspace', title: 'Faculty Experience',
    desc: 'Minimize repetitive grading administration so professors can focus on teaching and student mentorship.',
    features: [
      'Fast one-tap attendance roll sheets',
      'Rapid inline rubric assessment engine',
      'Office hours booking sync with calendar',
      'Early warning flags for struggling students',
    ],
    preview: (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent dark:border-slate-700/30 mb-6 transition-colors">
        <div className="flex items-center justify-between text-label-xs mb-2">
          <span className="font-semibold text-slate-900 dark:text-white transition-colors">CS-401 Distributed Systems</span>
          <span className="text-slate-500 dark:text-slate-400 transition-colors">Midterm Exam</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2 transition-colors">
          <div className="bg-secondary h-2 rounded-full" style={{ width: '93%' }}></div>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 transition-colors">42 of 45 graded</span>
          <span className="text-secondary font-bold cursor-pointer hover:underline">Bulk Publish Results</span>
        </div>
      </div>
    ),
    cta: 'Explore Teacher Portal', href: '#faculty-workspace',
  },
  {
    icon: 'shield_person', badge: 'Institutional Command', title: 'Administrator Console',
    desc: 'Complete organizational control, compliance reporting, and fiscal health tracking across entire university systems.',
    features: [
      'Multi-campus unified student master roster',
      'Tuition & bursar billing reconciliation',
      'Faculty teaching load & credit hour balancing',
      'Instant government accreditation exports',
    ],
    preview: (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent dark:border-slate-700/30 mb-6 transition-colors">
        <div className="flex items-center justify-between text-label-xs">
          <span className="text-slate-500 dark:text-slate-400 transition-colors">Fall Tuition Collection</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold transition-colors">93.3% Reconciled</span>
        </div>
        <p className="font-headline-sm text-slate-900 dark:text-white font-bold mt-1 transition-colors">$4.2M <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal transition-colors">/ $4.5M projected</span></p>
        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 transition-colors">Faculty Retention Rate: <strong className="text-slate-900 dark:text-white font-semibold transition-colors">97.4%</strong></div>
      </div>
    ),
    cta: 'Explore Admin Console', href: '#admin-console',
  },
];

export default function RolePortals() {
  return (
    <section className="py-24 px-margin lg:px-margin-lg" id="role-portals">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Tailored Portals</span>
          <h2 className="font-display text-headline-lg text-slate-900 dark:text-white mt-2 font-bold tracking-tight transition-colors">One Platform. Three Powerful Experiences.</h2>
          <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">Built with deliberate workflows customized for every stakeholder across your institution.</p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg"
        >
          {experiences.map((exp) => (
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={hoverElevate}
              key={exp.title} 
              className="p-7 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none flex flex-col justify-between group cursor-pointer transition-colors duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-secondary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[26px]">{exp.icon}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-label-xs font-semibold bg-slate-100 dark:bg-cyan-900/30 text-slate-600 dark:text-cyan-400 transition-colors">{exp.badge}</span>
                </div>
                <h3 className="font-display text-headline-md text-slate-900 dark:text-white font-bold tracking-tight transition-colors">{exp.title}</h3>
                <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">{exp.desc}</p>
                <ul className="flex flex-col gap-2.5 my-6 text-body-sm text-slate-700 dark:text-slate-300 transition-colors">
                  {exp.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check</span> {feat}
                    </li>
                  ))}
                </ul>
                {exp.preview}
              </div>
              <a className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-cyan-400 font-label-md group-hover:bg-secondary group-hover:border-secondary dark:group-hover:bg-secondary dark:group-hover:border-secondary group-hover:text-white transition-all" href={exp.href}>
                <span>{exp.cta}</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
