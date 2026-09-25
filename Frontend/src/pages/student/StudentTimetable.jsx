import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Video, AlertTriangle 
} from 'lucide-react';
import { 
  startOfWeek, endOfWeek, eachDayOfInterval, format, 
  isSameDay, isToday, addWeeks, subWeeks, parse, 
  isBefore, isAfter, set, getDay
} from 'date-fns';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import DashboardSkeleton from '../../components/student/DashboardSkeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { fetchTimetable } from '../../services/studentApi';
import { cn } from '@/lib/utils';

// Helper to determine status based on current time
function getClassStatus(startTimeStr, endTimeStr, dateObj) {
  const now = new Date();
  
  if (!isSameDay(dateObj, now)) {
    return isBefore(dateObj, now) ? 'COMPLETED' : 'UPCOMING';
  }

  // Parse "10:30" to a date object for today
  const startObj = parse(startTimeStr, 'HH:mm', dateObj);
  const endObj = parse(endTimeStr, 'HH:mm', dateObj);

  if (isAfter(now, endObj)) return 'COMPLETED';
  if (isBefore(now, startObj)) return 'UPCOMING';
  return 'ONGOING';
}

const statusStyles = {
  UPCOMING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ONGOING: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  COMPLETED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function StudentTimetable() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [courseFilter, setCourseFilter] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all for enrolled courses (in a real app we might fetch range)
      const data = await fetchTimetable();
      setSchedules(data);
    } catch (err) {
      setError(err.message || 'Unable to load timetable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uniqueCourses = useMemo(() => {
    const map = new Map();
    schedules.forEach(s => {
      if (!map.has(s.courseId)) {
        map.set(s.courseId, { id: s.courseId, code: s.courseCode, title: s.courseTitle });
      }
    });
    return Array.from(map.values());
  }, [schedules]);

  // Generate days for the current selected week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 6); // Mon-Sat

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter schedules based on course selection
  const filteredSchedules = schedules.filter(s => 
    courseFilter === 'all' || s.courseId === courseFilter
  );

  // Group by day of week
  const schedulesByDay = useMemo(() => {
    const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] };
    filteredSchedules.forEach(s => {
      grouped[s.dayOfWeek]?.push(s);
    });
    
    // Sort each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [filteredSchedules]);

  // Today's summary calculation
  const todayDate = new Date();
  const todayDay = todayDate.getDay();
  const todaySchedules = schedulesByDay[todayDay] || [];
  
  const stats = useMemo(() => {
    let completed = 0;
    let upcoming = 0;
    let ongoing = 0;
    
    todaySchedules.forEach(s => {
      const st = getClassStatus(s.startTime, s.endTime, todayDate);
      if (st === 'COMPLETED') completed++;
      if (st === 'UPCOMING') upcoming++;
      if (st === 'ONGOING') ongoing++;
    });
    
    return { completed, upcoming, ongoing, total: todaySchedules.length };
  }, [todaySchedules, todayDate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Timetable" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Class Schedule</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plan your classes and stay organized.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevWeek}>
                <ChevronLeft size={16} />
              </Button>
              <div className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 rounded-md min-w-[150px] text-center">
                {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
              </div>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight size={16} />
              </Button>
              <Button variant="default" size="sm" onClick={goToToday} className="ml-2">
                Today
              </Button>
            </div>
          </div>

          {loading && <DashboardSkeleton />}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <AlertTriangle size={32} className="text-red-500 mb-4" />
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Unable to load timetable</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Top Row: Today's Summary + Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <CalendarIcon size={24} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Today's Classes</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {stats.total > 0 ? `${stats.total} classes scheduled today` : 'No classes scheduled today'}
                        </p>
                      </div>
                    </div>
                    {stats.total > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
                          <p className="text-xl font-bold text-slate-900 dark:text-white font-display">{stats.completed}</p>
                          <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Done</p>
                        </div>
                        <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-display">{stats.ongoing}</p>
                          <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Ongoing</p>
                        </div>
                        <div className="text-center px-3">
                          <p className="text-xl font-bold text-slate-900 dark:text-white font-display">{stats.upcoming}</p>
                          <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Upcoming</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="lg:col-span-1 border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 p-5 flex flex-col justify-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Filter by Course</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="all">All Enrolled Courses</option>
                    {uniqueCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </Card>
              </div>

              {/* Desktop Weekly Grid (hidden on mobile/tablet) */}
              <div className="hidden lg:block bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm shadow-slate-200/50 dark:shadow-none">
                <div className="grid grid-cols-6 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
                  {weekDays.map(day => {
                    const isTodayBool = isToday(day);
                    return (
                      <div key={day.toString()} className={cn(
                        "py-3 text-center transition-colors",
                        isTodayBool ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                      )}>
                        <p className={cn(
                          "text-xs font-semibold uppercase tracking-wider mb-0.5",
                          isTodayBool ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                        )}>{format(day, 'EEE')}</p>
                        <p className={cn(
                          "text-xl font-display font-bold",
                          isTodayBool ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
                        )}>{format(day, 'd')}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-6 divide-x divide-slate-100 dark:divide-slate-800 min-h-[400px]">
                  {weekDays.map(day => {
                    const dayIndex = day.getDay();
                    const daySchedules = schedulesByDay[dayIndex] || [];
                    const isTodayBool = isToday(day);

                    return (
                      <div key={day.toString()} className={cn(
                        "p-3 flex flex-col gap-3",
                        isTodayBool ? "bg-indigo-50/20 dark:bg-indigo-900/5" : ""
                      )}>
                        {daySchedules.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-xs text-slate-400 dark:text-slate-600">No classes</span>
                          </div>
                        ) : (
                          daySchedules.map((sch, i) => {
                            const status = getClassStatus(sch.startTime, sch.endTime, day);
                            return (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={sch.id}
                                className={cn(
                                  "p-3 rounded-xl border flex flex-col gap-2 transition-all hover:shadow-md",
                                  status === 'ONGOING' 
                                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" 
                                    : "bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusStyles[status])}>
                                    {status}
                                  </Badge>
                                  {sch.isOnline && <Video size={12} className="text-indigo-500" />}
                                </div>
                                
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1" title={sch.courseTitle}>
                                    {sch.courseTitle}
                                  </p>
                                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                    {sch.courseCode} • {sch.classType}
                                  </p>
                                </div>

                                <div className="space-y-1 mt-1">
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                    <Clock size={10} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{sch.startTime} - {sch.endTime}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                    <MapPin size={10} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{sch.room || 'TBA'}</span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile/Tablet List View */}
              <div className="lg:hidden space-y-4">
                {weekDays.map(day => {
                  const dayIndex = day.getDay();
                  const daySchedules = schedulesByDay[dayIndex] || [];
                  const isTodayBool = isToday(day);

                  // Only show days that have classes, UNLESS it's today
                  if (daySchedules.length === 0 && !isTodayBool) return null;

                  return (
                    <Card key={day.toString()} className={cn(
                      "overflow-hidden border-none shadow-sm",
                      isTodayBool ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#050811]" : ""
                    )}>
                      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {format(day, 'EEEE, d MMMM')}
                        </span>
                        {isTodayBool && <Badge className="bg-indigo-600 hover:bg-indigo-700">Today</Badge>}
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {daySchedules.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">No classes scheduled.</p>
                        ) : (
                          daySchedules.map((sch) => {
                            const status = getClassStatus(sch.startTime, sch.endTime, day);
                            return (
                              <div key={sch.id} className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <div className="shrink-0 flex flex-col items-center justify-center px-2 border-r border-slate-200 dark:border-slate-700 min-w-[80px]">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{sch.startTime}</span>
                                  <span className="text-xs text-slate-500">{sch.endTime}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-none", statusStyles[status])}>
                                      {status}
                                    </Badge>
                                    {sch.isOnline && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-600 bg-indigo-50">Online</Badge>}
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {sch.courseTitle}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                                    {sch.courseCode} • {sch.instructorName || 'TBA'}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <MapPin size={12} className="text-slate-400" />
                                    <span className="truncate">{sch.room || 'TBA'} {sch.building ? `(${sch.building})` : ''}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
