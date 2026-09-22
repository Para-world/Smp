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

export default function ProblemSolution() {
  return (
    <section className="py-24 px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Operational Shift</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
            Managing students shouldn&apos;t be complicated.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Traditional academic operations are siloed, manual, and error-prone. EduSphere bridges every administrative and educational touchpoint into a unified, high-speed digital cockpit.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg">
          {/* Legacy Side */}
          <div className="p-8 rounded-2xl bg-surface-container-low shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error/10 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">The Legacy Friction</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Fragmented tools and obsolete paper records</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4 mt-2">
              {legacyProblems.map((problem, i) => (
                <li key={i} className="flex items-start gap-3 text-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">remove_circle</span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Solution Side */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-xl flex flex-col gap-space-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">The EduSphere Solution</h3>
                <p className="font-body-sm text-body-sm text-emerald-700 font-semibold">Unified, automated, and audit-ready</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4 mt-2">
              {solutions.map((solution, i) => (
                <li key={i} className="flex items-start gap-3 text-body-md text-primary font-medium">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">verified</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
