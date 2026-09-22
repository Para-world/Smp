const stakeholders = [
  { icon: 'person', title: 'For Students', quote: '\u201CStay organized, track your academic progress, and never miss an assignment deadline or exam alert.\u201D', metric: '98% Student Satisfaction' },
  { icon: 'history_edu', title: 'For Teachers', quote: '\u201CSpend less time on manual paperwork and grading, and more time mentoring the next generation.\u201D', metric: '7.5 hrs/week saved per educator' },
  { icon: 'manage_accounts', title: 'For Administrators', quote: '\u201CGain 360° visibility into institutional health, enrollments, tuition billing, and legal compliance.\u201D', metric: '100% Audit Readiness' },
  { icon: 'analytics', title: 'For Campus Boards', quote: '\u201CMake data-backed capital and curricular decisions with real-time academic intelligence.\u201D', metric: 'Predictive Enrollment AI' },
];

export default function StakeholderValue() {
  return (
    <section className="py-24 bg-surface-container-low px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Holistic Impact</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2">Built for everyone in your institution</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Every persona gains dedicated tools engineered to remove friction and heighten focus.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-sm">
          {stakeholders.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">{s.title}</h3>
                <blockquote className="font-body-sm text-body-sm text-on-surface-variant italic mt-3">{s.quote}</blockquote>
              </div>
              <p className="text-label-xs font-semibold text-secondary pt-4">{s.metric}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
