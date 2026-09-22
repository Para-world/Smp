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
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-margin lg:px-margin-lg pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-gutter-lg pb-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img alt="EduSphere Logo" className="h-7 w-auto object-contain" src={LOGO_SRC} />
              <span className="font-headline-sm text-headline-sm text-primary">EduSphere</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Unified academic governance, real-time student analytics, and institution-wide collaboration engineered for premier schools, colleges, and university systems.
            </p>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed w-fit">
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
              <span className="font-label-xs text-label-xs font-semibold">All Systems Operational - 99.9% Uptime</span>
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-space-sm">
              <span className="font-label-xs text-label-xs uppercase text-on-surface-variant font-bold tracking-wider">{col.title}</span>
              <ul className="flex flex-col gap-space-xs">
                {col.links.map((link) => (
                  <li key={link} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container/40 px-space-md py-space-sm rounded-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 EduSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-space-md">
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">SOC2 Type II Certified</span>
            <span className="text-on-surface-variant/40">•</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">FERPA &amp; GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
