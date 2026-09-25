import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, FileWarning, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

import { fetchCourseAttendance } from '../../services/studentApi';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusStyles = {
  present: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  absent: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle },
  late: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  excused: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: FileWarning },
};

export default function CourseAttendanceDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for the table (Client-side since we fetch all course history)
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCourseAttendance(courseId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to load course attendance details.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const course = data?.course;
  const summary = data?.summary;
  const history = data?.history || [];

  const filteredHistory = history.filter(record => {
    if (statusFilter !== 'all' && record.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Course Attendance" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1200px] mx-auto">
          {loading && (
            <div className="flex justify-center py-20"><span className="material-symbols-outlined text-indigo-600 animate-spin text-4xl">progress_activity</span></div>
          )}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Access Denied or Not Found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate('/student/attendance')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Attendance
              </button>
            </motion.div>
          )}

          {!loading && !error && course && (
            <div className="space-y-6">
              {/* Back Link */}
              <Link
                to="/student/attendance"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Attendance Overview
              </Link>

              {/* Course Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <Badge variant="outline" className="mb-2 font-mono bg-slate-100 dark:bg-slate-800">{course.code}</Badge>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {course.title}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Instructor: {course.faculty?.name || 'TBA'}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Total Attendance
                  </p>
                  <p className={`text-3xl font-display font-bold ${summary.percentage < 75 ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {summary.percentage}%
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <CheckCircle2 className="text-emerald-500 mb-1" size={24} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.present}</span>
                    <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">Present</span>
                  </CardContent>
                </Card>
                <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <XCircle className="text-red-500 mb-1" size={24} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.absent}</span>
                    <span className="text-xs font-semibold uppercase text-red-700 dark:text-red-400">Absent</span>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <Clock className="text-amber-500 mb-1" size={24} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.late}</span>
                    <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">Late</span>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <FileWarning className="text-blue-500 mb-1" size={24} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.excused}</span>
                    <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">Excused</span>
                  </CardContent>
                </Card>
              </div>

              {/* History Table */}
              <Card>
                <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <CalendarIcon size={18} className="text-indigo-500" />
                    Attendance History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                          <TableRow className="border-slate-100 dark:border-slate-800">
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Remarks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHistory.map((record) => {
                            const style = statusStyles[record.status] || statusStyles.present;
                            const Icon = style.icon;
                            return (
                              <TableRow key={record.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                                  {format(new Date(record.date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={`text-xs gap-1 py-1 ${style.bg} ${style.color}`}>
                                    <Icon size={12} />
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                  {record.remarks || <span className="italic opacity-50">None</span>}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center">
                      <CalendarIcon size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                      {history.length === 0 ? "No attendance has been recorded for this course yet." : "No records match the selected filter."}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
