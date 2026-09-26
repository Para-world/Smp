import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, AlertTriangle, Users, UserCheck, BookOpen, 
  ClipboardCheck, Award, FileText, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { fetchAdminDashboard } from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = data ? [
    {
      title: 'Total Students',
      value: data.students.total,
      subValue: `${data.students.active} Active`,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Total Faculty',
      value: data.faculty.total,
      subValue: `${data.faculty.active} Active`,
      icon: UserCheck,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Total Courses',
      value: data.courses.total,
      subValue: `${data.courses.active} Active`,
      icon: BookOpen,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Average Attendance',
      value: `${data.academic.averageAttendance}%`,
      subValue: 'Across all courses',
      icon: ClipboardCheck,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
    }
  ] : [];

  const academicHighlights = data ? [
    { label: 'Upcoming Exams', value: data.academic.upcomingExams, icon: Award, color: 'text-indigo-500' },
    { label: 'Pending Assignments', value: data.academic.pendingAssignments, icon: FileText, color: 'text-rose-500' },
    { label: 'Published Results', value: data.academic.publishedResults, icon: ClipboardCheck, color: 'text-teal-500' },
  ] : [];

  const attendanceData = data?.analytics?.attendanceTrend || [];
  const enrollmentData = data?.analytics?.enrollmentTrend || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <AdminHeader
          pageTitle="Institutional Dashboard"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-blue-500 text-[40px] animate-spin">
                progress_activity
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">Loading institutional data...</p>
            </div>
          )}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Unable to load dashboard
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {error}
              </p>
              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </motion.div>
          )}

          {!loading && !error && data && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4"
                  >
                    <div className={`p-4 rounded-xl ${stat.lightColor}`}>
                      <stat.icon size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-none mb-2">{stat.value}</h3>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{stat.subValue}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Academic Highlights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Academic Operations</h3>
                  <div className="space-y-6">
                    {academicHighlights.map((hl, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 ${hl.color}`}>
                            <hl.icon size={18} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{hl.label}</span>
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">{hl.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Charts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Student Enrollment Trend</h3>
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                          itemStyle={{ color: '#60a5fa' }}
                        />
                        <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                
                {/* Attendance Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-3 flex flex-col"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Attendance Overview</h3>
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                          cursor={{ fill: '#334155', opacity: 0.1 }}
                        />
                        <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
