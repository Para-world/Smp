const legacyProblems = [
  'Scattered student records across disparate paper files, binders, and disconnected desktop spreadsheets.',
  'Manual, error-prone paper roll calls and delayed attendance registers with zero parent visibility.',
  'Clunky exam grading pipelines, delayed result distribution, and manual calculation errors in transcripts.',
  'Fragmented communication between faculty, advisors, and parents with missed critical announcements.',
  'Overwhelmed registrar staff drowning in backlog transcript requests and compliance reports.',
];

const solutions = [
  'Centralized 360° student dossiers with instant verified academic audit trails and encrypted document vaults.',
  'Geofenced & QR/RFID instantaneous attendance with automated push and SMS guardian alerts for absences.',
  'Algorithmic digital gradebook with auto-weighted GPA/CGPA calculations and instantaneous student access.',
  'Integrated multi-channel broadcast engine for emergency campus notices, fee reminders, and timetable shifts.',
  'One-click verifiable official e-transcripts and predictive retention indicators flagging at-risk coursework.',
];

import { motion } from 'framer-motion';
import { slideInLeft, slideInRight, fadeInUp } from '../utils/animations';

export default function ProblemSolution() {
  return (
    <section className="py-24 px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Operational Shift</span>
          <h2 className="font-display text-headline-lg text-slate-900 dark:text-white mt-2 font-bold tracking-tight transition-colors">
            Managing students shouldn&apos;t be complicated.
          </h2>
          <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">
            Traditional academic operations are siloed, manual, and error-prone. EduSphere bridges every administrative and educational touchpoint into a unified, high-speed digital cockpit.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg overflow-hidden">
          {/* Legacy Side */}
          <motion.div 
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col gap-space-md transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error/10 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
              </div>
              <div>
                <h3 className="font-display text-headline-sm text-slate-900 dark:text-white font-bold transition-colors">The Legacy Friction</h3>
                <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 transition-colors">Fragmented tools and obsolete paper records</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4 mt-2">
              {legacyProblems.map((problem, i) => (
                <li key={i} className="flex items-start gap-3 text-body-md text-slate-600 dark:text-slate-400 transition-colors">
                  <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">remove_circle</span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          {/* Solution Side */}
          <motion.div 
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="p-8 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-space-md relative overflow-hidden transition-colors duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
              </div>
              <div>
                <h3 className="font-display text-headline-sm text-slate-900 dark:text-white font-bold transition-colors">The EduSphere Solution</h3>
                <p className="font-body-sm text-body-sm text-emerald-600 dark:text-emerald-400 font-semibold transition-colors">Unified, automated, and audit-ready</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4 mt-2">
              {solutions.map((solution, i) => (
                <li key={i} className="flex items-start gap-3 text-body-md text-slate-800 dark:text-slate-200 font-medium transition-colors">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px] shrink-0 mt-0.5 transition-colors">verified</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
