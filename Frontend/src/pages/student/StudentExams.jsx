import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck, Clock, MapPin, AlertTriangle, Calendar, 
  Search, SlidersHorizontal, BookOpen, Video, Info
} from 'lucide-react';
import { 
  isBefore, isAfter, isSameMonth, parseISO, parse, isSameDay
} from 'date-fns';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import DashboardSkeleton from '../../components/student/DashboardSkeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { fetchExams } from '../../services/studentApi';
import { cn } from '@/lib/utils';

// Helper to determine accurate status based on current time
function getExamStatus(examDateStr, startTimeStr, endTimeStr, backendStatus) {
  if (backendStatus === 'CANCELLED' || backendStatus === 'POSTPONED') return backendStatus;
  
  const now = new Date();
  const examDate = parseISO(examDateStr);
  
  if (!isSameDay(examDate, now)) {
    return isBefore(examDate, now) ? 'COMPLETED' : 'UPCOMING';
  }

  // Same day check
  const startObj = parse(startTimeStr, 'HH:mm', examDate);
  const endObj = parse(endTimeStr, 'HH:mm', examDate);

  if (isAfter(now, endObj)) return 'COMPLETED';
  if (isBefore(now, startObj)) return 'UPCOMING';
  return 'ONGOING';
}

const statusStyles = {
  UPCOMING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ONGOING: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse',
  COMPLETED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  POSTPONED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// Formats type
const formatType = (type) => type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

export default function StudentExams() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [now, setNow] = useState(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExams();
      setExams(data);
    } catch (err) {
      setError(err.message || 'Unable to load exams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tick for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // Compute actual statuses based on time
  const processedExams = useMemo(() => {
    return exams.map(exam => ({
      ...exam,
      actualStatus: getExamStatus(exam.date, exam.startTime, exam.endTime, exam.status)
    }));
  }, [exams, now]); // recompute status when `now` changes (every minute)

  // Unique courses for filter
  const uniqueCourses = useMemo(() => {
    const map = new Map();
    processedExams.forEach(e => {
      if (!map.has(e.courseId)) {
        map.set(e.courseId, { id: e.courseId, code: e.courseCode, title: e.courseTitle });
      }
    });
    return Array.from(map.values());
  }, [processedExams]);

  // Filters and sort
  const filteredExams = useMemo(() => {
    return processedExams
      .filter(e => courseFilter === 'all' || e.courseId === courseFilter)
      .filter(e => statusFilter === 'all' || e.actualStatus === statusFilter)
      .filter(e => {
        const query = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(query) ||
          e.courseTitle.toLowerCase().includes(query) ||
          e.courseCode.toLowerCase().includes(query) ||
          (e.venue && e.venue.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort nearest first
  }, [processedExams, courseFilter, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    let upcoming = 0;
    let completed = 0;
    let thisMonth = 0;
    let nextExam = null;

    processedExams.forEach(e => {
      if (e.actualStatus === 'UPCOMING') upcoming++;
      if (e.actualStatus === 'COMPLETED') completed++;
      if (isSameMonth(parseISO(e.date), now)) thisMonth++;
    });

    const upcomings = processedExams.filter(e => e.actualStatus === 'UPCOMING').sort((a, b) => new Date(a.date) - new Date(b.date));
    if (upcomings.length > 0) nextExam = upcomings[0];

    return { upcoming, completed, thisMonth, nextExam };
  }, [processedExams, now]);

  // Countdown string generator
  const getCountdown = (exam) => {
    const startObj = parse(exam.startTime, 'HH:mm', parseISO(exam.date));
    const diff = startObj - now;
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return `${days} Days ${hours} Hours`;
    if (hours > 0) return `${hours} Hours ${mins} Mins`;
    return `${mins} Minutes`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Examinations" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <FileCheck size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Examinations</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">View your upcoming exams, schedules, venues, and important instructions.</p>
              </div>
            </div>
          </div>

          {loading && <DashboardSkeleton />}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <AlertTriangle size={32} className="text-red-500 mb-4" />
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Unable to load exams</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Upcoming Exams</p>
                  <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.upcoming}</p>
                </Card>
                <Card className="p-6 border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Completed Exams</p>
                  <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.completed}</p>
                </Card>
                <Card className="p-6 border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Exams This Month</p>
                  <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.thisMonth}</p>
                </Card>
              </div>

              {/* Next Exam Highlight */}
              {stats.nextExam && (
                <Card className="overflow-hidden border-none shadow-md shadow-indigo-100/50 dark:shadow-none">
                  <div className="bg-indigo-600 dark:bg-indigo-900/50 p-6 sm:p-8 text-white relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      <FileCheck size={120} />
                    </div>
                    <div className="relative z-10">
                      <Badge variant="secondary" className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none uppercase tracking-wider text-xs px-3 py-1">
                        Next Examination
                      </Badge>
                      <h2 className="text-3xl font-display font-bold mb-2">{stats.nextExam.courseTitle}</h2>
                      <p className="text-indigo-100 text-lg font-mono mb-4">{stats.nextExam.courseCode} • {formatType(stats.nextExam.examType)}</p>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-indigo-50 font-medium">
                        <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(stats.nextExam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div className="flex items-center gap-2"><Clock size={16} /> {stats.nextExam.startTime} – {stats.nextExam.endTime}</div>
                        <div className="flex items-center gap-2"><MapPin size={16} /> {stats.nextExam.venue || 'TBA'}</div>
                      </div>
                    </div>
                    <div className="relative z-10 flex flex-col items-start md:items-end gap-4 shrink-0">
                      <div className="text-left md:text-right">
                        <p className="text-xs uppercase tracking-wider text-indigo-200 mb-1 font-semibold">Starts in</p>
                        <p className="text-2xl font-bold font-mono">{getCountdown(stats.nextExam) || 'Starting Soon'}</p>
                      </div>
                      <Link to={`/student/exams/${stats.nextExam.id}`}>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg shadow-black/10">
                          View Exam Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}

              {/* Filters and List */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search exams, courses, venues..." 
                      className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm focus:outline-none"
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                    >
                      <option value="all">All Courses</option>
                      {uniqueCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.code}</option>
                      ))}
                    </select>
                    <select
                      className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm focus:outline-none"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="POSTPONED">Postponed</option>
                    </select>
                  </div>
                </div>

                {filteredExams.length === 0 ? (
                  <Card className="flex flex-col items-center justify-center py-16 border-dashed border-2 shadow-none bg-transparent">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <FileCheck size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-medium text-lg mb-1">No examinations scheduled</p>
                    <p className="text-sm text-slate-500">There are currently no examinations available matching your filters.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filteredExams.map((exam, index) => (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Card className="flex flex-col h-full overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
                            <div className="p-5 flex-1 flex flex-col">
                              <div className="flex items-start justify-between mb-3 gap-2">
                                <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", statusStyles[exam.actualStatus])}>
                                  {exam.actualStatus}
                                </Badge>
                                {exam.isOnline && <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-indigo-200 text-indigo-600 bg-indigo-50 gap-1"><Video size={10} /> Online</Badge>}
                              </div>
                              
                              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1" title={exam.courseTitle}>
                                {exam.courseTitle}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono mb-4">{exam.courseCode}</p>

                              <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                  <BookOpen size={14} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{exam.title} ({formatType(exam.examType)})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                  <Calendar size={14} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                  <Clock size={14} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{exam.startTime} – {exam.endTime} ({exam.durationMinutes}m)</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                  <MapPin size={14} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{exam.venue || 'TBA'}</span>
                                </div>
                              </div>

                              <Link to={`/student/exams/${exam.id}`} className="mt-auto block w-full">
                                <Button variant="outline" className="w-full justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
