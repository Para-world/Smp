import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, BookX } from 'lucide-react';
import { fetchStudentAttendance } from '../../services/studentApi';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import AttendanceCourseCard from '../../components/student/attendance/AttendanceCourseCard';
import AttendanceSkeleton from '../../components/student/attendance/AttendanceSkeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentAttendance() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStudentAttendance();
      setData(result);
    } catch (err) {
      setError(err.message || 'Unable to load your attendance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = data?.summary;
  const courses = data?.courses || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      {/* Sidebar */}
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <StudentHeader pageTitle="Attendance" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {loading && <AttendanceSkeleton />}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Unable to load attendance
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {error}
              </p>
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </motion.div>
          )}

          {!loading && !error && data && (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Attendance Overview
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Track your attendance across all enrolled courses.
                </p>
              </div>

              {courses.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 text-center">
                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                     <BookX size={28} className="text-slate-400" />
                   </div>
                   <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
                     No attendance records yet
                   </h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                     Attendance will appear here once your classes are recorded by instructors.
                   </p>
                 </div>
              ) : (
                <>
                  {/* Overall Summary Card */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                      <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500" />
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                          
                          <div className="text-center md:text-left">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                              Overall Attendance
                            </p>
                            <h3 className="text-5xl md:text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                              {summary.percentage}%
                            </h3>
                          </div>
                          
                          <div className="flex-1 w-full max-w-lg space-y-4">
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${summary.percentage}%` }} 
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                className={`h-full ${summary.percentage < 75 ? 'bg-red-500' : summary.percentage < 90 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                              />
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-slate-600 dark:text-slate-300">{summary.present} Present</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <span className="text-slate-600 dark:text-slate-300">{summary.absent} Absent</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-slate-600 dark:text-slate-300">{summary.total} Total Classes</span>
                              </div>
                            </div>
                          </div>

                        </div>
                        {summary.percentage < 75 && summary.total > 0 && (
                          <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              Your overall attendance is below the recommended 75% threshold. Please review your course attendance details.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Course Wise Section */}
                  <div>
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-4">
                      Attendance by Course
                    </h3>
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      layout
                    >
                      <AnimatePresence>
                        {courses.map((course, idx) => (
                          <AttendanceCourseCard 
                            key={course.courseId} 
                            course={course} 
                            delay={idx * 0.05}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
