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
      <div className="p-4 rounded-xl bg-surface-container-low mb-6">
        <div className="flex items-center justify-between text-label-xs">
          <span className="font-semibold text-primary">Next Class: Machine Learning</span>
          <span className="text-secondary font-bold">10:30 AM</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2">
          <div>
            <p className="text-[11px] text-on-surface-variant">Cumulative GPA</p>
            <p className="font-bold text-primary text-headline-sm">3.88 <span className="text-[11px] text-on-surface-variant font-normal">/ 4.0</span></p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-label-xs font-semibold">Dean&apos;s Honor</span>
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
      <div className="p-4 rounded-xl bg-surface-container-low mb-6">
        <div className="flex items-center justify-between text-label-xs mb-2">
          <span className="font-semibold text-primary">CS-401 Distributed Systems</span>
          <span className="text-on-surface-variant">Midterm Exam</span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-2 mb-2">
          <div className="bg-secondary h-2 rounded-full" style={{ width: '93%' }}></div>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-on-surface-variant">42 of 45 graded</span>
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
      <div className="p-4 rounded-xl bg-surface-container-low mb-6">
        <div className="flex items-center justify-between text-label-xs">
          <span className="text-on-surface-variant">Fall Tuition Collection</span>
          <span className="text-emerald-600 font-bold">93.3% Reconciled</span>
        </div>
        <p className="font-headline-sm text-primary font-bold mt-1">$4.2M <span className="text-on-surface-variant text-[11px] font-normal">/ $4.5M projected</span></p>
        <div className="mt-2 text-[10px] text-on-surface-variant">Faculty Retention Rate: <strong className="text-primary font-semibold">97.4%</strong></div>
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
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2">One Platform. Three Powerful Experiences.</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Built with deliberate workflows customized for every stakeholder across your institution.</p>
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
              className="p-7 rounded-2xl bg-surface-container-lowest shadow-lg flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px]">{exp.icon}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-label-xs font-semibold bg-secondary-fixed text-on-secondary-fixed">{exp.badge}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary">{exp.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{exp.desc}</p>
                <ul className="flex flex-col gap-2.5 my-6 text-body-sm text-on-surface">
                  {exp.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check</span> {feat}
                    </li>
                  ))}
                </ul>
                {exp.preview}
              </div>
              <a className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-surface-container text-secondary font-label-md group-hover:bg-secondary group-hover:text-on-secondary transition-all" href={exp.href}>
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
