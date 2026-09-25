import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle2, Clock, FileWarning, Search, Filter, AlertTriangle, ArrowRight, BookOpen, Calendar
} from 'lucide-react';
import { format, isPast, isToday, formatDistanceToNow } from 'date-fns';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { fetchAssignments } from '../../services/studentApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortOption, setSortOption] = useState('dueDateNearest');

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAssignments();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to load assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const assignments = data?.assignments || [];
  const summary = data?.summary || { total: 0, pending: 0, submitted: 0, overdue: 0 };
  
  // Get unique courses for the dropdown
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseId))).map(id => {
    return assignments.find(a => a.courseId === id);
  });

  let filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      assignment.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Apply sorting
  filteredAssignments.sort((a, b) => {
    if (sortOption === 'dueDateNearest') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortOption === 'dueDateLatest') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    } else if (sortOption === 'course') {
      return a.courseCode.localeCompare(b.courseCode);
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'submitted':
      case 'graded':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"><CheckCircle2 className="w-3 h-3 mr-1"/> {status === 'graded' ? 'Graded' : 'Submitted'}</Badge>;
      case 'overdue':
        return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none"><FileWarning className="w-3 h-3 mr-1"/> Overdue</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      default:
        return null;
    }
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
        <StudentHeader pageTitle="Assignments" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Assignments</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stay on top of your coursework and upcoming deadlines.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><span className="material-symbols-outlined text-indigo-600 animate-spin text-4xl">progress_activity</span></div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Unable to load assignments</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{error}</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{summary.total}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{summary.pending}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submitted</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{summary.submitted}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <FileWarning className="text-red-600 dark:text-red-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{summary.overdue}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:max-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    />
                  </div>
                  
                  <select
                    className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:max-w-[180px]"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {uniqueCourses.map(c => (
                      <option key={c.courseId} value={c.courseId}>{c.courseCode}</option>
                    ))}
                  </select>

                  <select
                    className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:max-w-[160px]"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="dueDateNearest">Due Date (Nearest)</option>
                    <option value="dueDateLatest">Due Date (Latest)</option>
                    <option value="course">Course</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0">
                  {['all', 'pending', 'submitted', 'overdue', 'graded'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                        statusFilter === status 
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white" 
                          : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignment List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Card 
                          className="group cursor-pointer hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 overflow-hidden"
                          onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Badge variant="outline" className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
                                    {assignment.courseCode}
                                  </Badge>
                                  {getStatusBadge(assignment.status)}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {assignment.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                                  {assignment.courseTitle}
                                </p>
                              </div>

                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-5">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar size={14} className={assignment.status === 'overdue' ? 'text-red-500' : 'text-slate-400'} />
                                  <span className={cn(
                                    "font-medium",
                                    assignment.status === 'overdue' ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"
                                  )}>
                                    {assignment.dueDate ? format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a') : 'No Due Date'}
                                  </span>
                                </div>
                                {assignment.score && (
                                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-md">
                                    Score: {assignment.score}/{assignment.maxScore}
                                  </div>
                                )}
                                {!assignment.score && assignment.status === 'pending' && assignment.dueDate && (
                                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    Due {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                                  </div>
                                )}
                              </div>

                              <div className="hidden sm:flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ml-2">
                                <ArrowRight size={18} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-400" size={24} />
                      </div>
                      <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white mb-1">No assignments found</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                        Try adjusting your filters or search query to find what you're looking for.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
