import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../utils/animations';

const students = [
  { initials: 'AM', name: 'Alexander Mitchell', email: 'alex.m@univ.edu', id: 'EDU-8821', program: 'B.Sc. Computer Science', attendance: '96.8%', attColor: 'text-emerald-600', gpa: '3.92', standing: 'Good Standing', standingBg: 'bg-emerald-100 text-emerald-700', avatarBg: 'bg-secondary-fixed text-on-secondary-fixed' },
  { initials: 'SL', name: 'Sarah Lin', email: 's.lin@univ.edu', id: 'EDU-9043', program: 'M.Sc. Artificial Intelligence', attendance: '98.2%', attColor: 'text-emerald-600', gpa: '4.00', standing: "Dean's Honor", standingBg: 'bg-secondary-fixed text-on-secondary-fixed', avatarBg: 'bg-surface-container-high text-primary' },
  { initials: 'JP', name: 'Julian Parker', email: 'j.parker@univ.edu', id: 'EDU-7742', program: 'B.A. Economics & Policy', attendance: '79.5%', attColor: 'text-amber-600', gpa: '3.12', standing: 'Needs Review', standingBg: 'bg-amber-100 text-amber-800', avatarBg: 'bg-amber-100 text-amber-800' },
  { initials: 'KV', name: 'Kavita Verma', email: 'k.verma@univ.edu', id: 'EDU-8119', program: 'B.Eng. Mechanical Systems', attendance: '94.0%', attColor: 'text-emerald-600', gpa: '3.75', standing: 'Good Standing', standingBg: 'bg-emerald-100 text-emerald-700', avatarBg: 'bg-surface-container-high text-primary' },
];

const sidebarItems = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'group', label: 'Students' },
  { icon: 'school', label: 'Courses' },
  { icon: 'schedule', label: 'Attendance' },
  { icon: 'assignment', label: 'Assignments' },
  { icon: 'analytics', label: 'Reports' },
  { icon: 'settings', label: 'Settings' },
];

const cockpitStats = [
  { label: 'Total Enrollment', value: '2,840', trend: 'Active Roster', trendColor: 'text-emerald-600' },
  { label: 'Campus Attendance', value: '92.4%', trend: "Today's Aggregate", trendColor: 'text-secondary' },
  { label: 'Active Modules', value: '48', trend: 'In Session', trendColor: 'text-on-surface-variant' },
  { label: 'Unresolved Inquiries', value: '12', trend: 'Under Dean Review', trendColor: 'text-amber-600' },
];

export default function ProductCockpit() {
  return (
    <section className="py-24 bg-[#050811] px-margin lg:px-margin-lg" id="product-cockpit">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-cyan-400 font-bold">Intuitive Interface</span>
          <h2 className="font-display text-headline-lg text-white mt-2 font-bold tracking-tight">Everything at a glance.</h2>
          <p className="font-body-md text-body-md text-slate-400 mt-2 leading-relaxed">Experience the lightning-fast, high-density institutional cockpit engineered for zero distraction.</p>
        </motion.div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          className="w-full bg-[#0B1120] border border-slate-800 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* App Navigation Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0B1120] border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-700 hover:bg-red-500 transition-colors cursor-pointer"></span>
                <span className="w-3 h-3 rounded-full bg-slate-700 hover:bg-amber-500 transition-colors cursor-pointer"></span>
                <span className="w-3 h-3 rounded-full bg-slate-700 hover:bg-emerald-500 transition-colors cursor-pointer"></span>
              </div>
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined text-[18px] text-slate-500 absolute left-3 top-2.5">search</span>
                <input className="bg-slate-800/50 border border-slate-700/50 pl-9 pr-12 py-1.5 rounded-lg text-body-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors w-72 shadow-inner" placeholder="Search students, courses, or IDs (Cmd+K)..." readOnly type="text" />
                <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-300 font-mono border border-slate-600">⌘K</kbd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg text-label-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-cyan-400">calendar_month</span>
                <span>Semester: Fall 2026</span>
              </div>
              <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-label-xs font-semibold shadow-sm hover:bg-cyan-500/20 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Enroll Student</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary text-label-xs font-bold flex items-center justify-center">AD</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Sidebar */}
            <div className="hidden lg:flex lg:col-span-2 bg-[#0F172A] p-4 flex-col justify-between text-slate-300">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">Navigation</span>
                {sidebarItems.map((item) => (
                  <div key={item.label} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-colors cursor-pointer ${item.active ? 'bg-[#1E293B] text-white font-medium' : 'hover:bg-slate-800'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${item.active ? 'text-blue-400' : ''}`}>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 text-[11px] text-slate-400 bg-slate-800/60 rounded-lg">
                <span className="text-emerald-400 font-semibold">● Online Sync</span>
                <p className="text-[10px] text-slate-500 mt-0.5">DB Latency: 12ms</p>
              </div>
            </div>
            {/* Main Workspace */}
            <div className="lg:col-span-10 p-6 flex flex-col gap-6">
              <motion.div 
                variants={staggerContainer} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {cockpitStats.map((stat) => (
                  <motion.div variants={fadeInUp} key={stat.label} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors"></div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <p className="font-display text-headline-md text-white font-bold mt-1 tracking-tight">{stat.value}</p>
                    <span className={`text-[11px] ${stat.trendColor} font-semibold`}>{stat.trend}</span>
                  </motion.div>
                ))}
              </motion.div>
              {/* Data Table */}
              <div className="overflow-x-auto">
                <div className="flex items-center justify-between pb-3">
                  <span className="font-display text-headline-sm text-white font-semibold">Recent Student Enrollments</span>
                  <span className="text-label-xs text-cyan-400 font-semibold hover:underline cursor-pointer">View Complete Roster (2,840) →</span>
                </div>
                <table className="w-full text-left text-body-sm">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400 font-label-xs uppercase text-[11px] border-y border-slate-800">
                      <th className="py-2.5 px-4 font-semibold">Student Profile</th>
                      <th className="py-2.5 px-4 font-semibold">Student ID</th>
                      <th className="py-2.5 px-4 font-semibold">Academic Program</th>
                      <th className="py-2.5 px-4 font-semibold">Attendance</th>
                      <th className="py-2.5 px-4 font-semibold">Term GPA</th>
                      <th className="py-2.5 px-4 font-semibold">Standing</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={staggerContainer} 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true }} 
                    className="divide-y divide-slate-800/50"
                  >
                    {students.map((s) => (
                      <motion.tr variants={fadeInUp} key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${s.avatarBg} font-bold flex items-center justify-center text-xs`}>{s.initials}</div>
                          <div>
                            <p className="font-semibold text-slate-200">{s.name}</p>
                            <p className="text-[11px] text-slate-500">{s.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{s.id}</td>
                        <td className="py-3 px-4 text-slate-300">{s.program}</td>
                        <td className={`py-3 px-4 font-semibold ${s.attColor}`}>{s.attendance}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.gpa}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full ${s.standingBg} text-[11px] font-semibold`}>{s.standing}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
