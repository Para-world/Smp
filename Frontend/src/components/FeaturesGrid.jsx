const features = [
  { icon: 'badge', tag: 'Lifecycle SIS', title: 'Student Dossiers', desc: 'Centralized profile 360°, emergency contacts, health forms, disciplinary logs, and immutable honor credentials.' },
  { icon: 'how_to_reg', tag: 'Attendance', title: 'Automated Check-in', desc: 'Dynamic QR codes, student mobile GPS check-in, or RFID card sync with instant absent notifications sent to guardians.' },
  { icon: 'menu_book', tag: 'Academic Engine', title: 'Course & Curriculum', desc: 'Multi-department syllabus builders, conflict-free timetable scheduling, and intelligent prerequisite validation.' },
  { icon: 'task', tag: 'Classroom Ops', title: 'Assignment Engine', desc: 'Integrated plagiarism screening, customizable grading rubrics, peer reviews, and multi-format student file submissions.' },
  { icon: 'grade', tag: 'Evaluation', title: 'Exams & Results', desc: 'Secure exam halls, automated GPA and CGPA calculations, class percentiles, and instant tamper-proof transcript issuing.' },
  { icon: 'campaign', tag: 'Engagement', title: 'Smart Notification Hub', desc: 'Emergency multi-channel broadcasts, automated overdue tuition reminders, and departmental lecture hall adjustments.' },
  { icon: 'monitoring', tag: 'Intelligence', title: 'Accreditation Analytics', desc: 'Ready-to-file reports for ABET, NAAC, and regional review boards with cohort progression and faculty ratio matrices.' },
  { icon: 'admin_panel_settings', tag: 'Governance', title: 'Granular Role RBAC', desc: 'Rigorous separation of privileges for Deans, Department Heads, Professors, Teaching Assistants, Parents, and Auditors.' },
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 bg-surface-container-low px-margin lg:px-margin-lg" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Platform Capabilities</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
            Everything you need to manage your institution
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Powerful, intuitive tools designed specifically for students, academic faculty, and university leadership.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-sm">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">{f.icon}</span>
                </div>
                <span className="text-label-xs font-label-xs text-secondary font-bold uppercase tracking-wide">{f.tag}</span>
                <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-2">{f.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{f.desc}</p>
              </div>
              <div className="pt-4 flex items-center text-label-xs font-semibold text-secondary group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
