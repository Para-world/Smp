import LOGO_SRC from '../assets/logo.png';

const footerColumns = [
  {
    title: 'Core Features',
    links: ['Student Information (SIS)', 'Admissions & Enrollment', 'Attendance Tracking', 'Curriculum Mapping'],
  },
  {
    title: 'Student & Faculty',
    links: ['Student Dashboard', 'Teacher Gradebook', 'Course Assignments', 'Parent Access Portal'],
  },
  {
    title: 'Admin & Intelligence',
    links: ['Campus Operations', 'Predictive Retention AI', 'Financial & Tuition Billing', 'Compliance Audits'],
  },
  {
    title: 'Resources & Legal',
    links: ['Documentation & API', 'Security & FERPA', 'Privacy Policy', 'Terms of Service'],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#050811] border-t border-slate-200/50 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-margin lg:px-margin-lg pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-gutter-lg pb-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img alt="EduSphere Logo" className="h-7 w-auto object-contain" src={LOGO_SRC} />
              <span className="font-display text-headline-sm text-slate-900 dark:text-white font-bold tracking-tight transition-colors">EduSphere</span>
            </div>
            <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed transition-colors">
              Unified academic governance, real-time student analytics, and institution-wide collaboration engineered for premier schools, colleges, and university systems.
            </p>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 w-fit transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse transition-colors"></span>
              <span className="font-label-xs text-label-xs font-semibold">All Systems Operational - 99.9% Uptime</span>
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-space-sm">
              <span className="font-label-xs text-label-xs uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider transition-colors">{col.title}</span>
              <ul className="flex flex-col gap-space-xs">
                {col.links.map((link) => (
                  <li key={link} className="font-body-sm text-body-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 px-space-md py-space-sm rounded-lg transition-colors">
          <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 transition-colors">© 2026 EduSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-space-md">
            <span className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">SOC2 Type II Certified</span>
            <span className="text-slate-300 dark:text-slate-700 transition-colors">•</span>
            <span className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">FERPA &amp; GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
