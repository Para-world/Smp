import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, Search, BookX } from 'lucide-react';
import { fetchStudentCourses } from '../../services/studentApi';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import CourseCard from '../../components/student/courses/CourseCard';
import CourseSkeleton from '../../components/student/courses/CourseSkeleton';

export default function StudentCourses() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || 'Unable to load your courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      
      // Search text
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(query);
        const codeMatch = c.code?.toLowerCase().includes(query);
        const instructorMatch = c.faculty?.name?.toLowerCase().includes(query);
        return titleMatch || codeMatch || instructorMatch;
      }
      
      return true;
    });
  }, [courses, searchQuery, statusFilter]);

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const currentSemesterName = courses[0]?.semester?.name || 'Current';
  const academicYear = courses[0]?.semester?.academicYear || '';

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
        {/* Header */}
        <StudentHeader
          pageTitle="My Courses"
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {/* Loading */}
          {loading && <CourseSkeleton />}

          {/* Error */}
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
                Unable to load your courses
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {error}
              </p>
              <button
                onClick={loadCourses}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </motion.div>
          )}

          {/* Content */}
          {!loading && !error && (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    My Courses
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {courses.length > 0 
                      ? `Semester ${currentSemesterName} ${academicYear ? `• Academic Year ${academicYear}` : ''}`
                      : 'View your enrolled courses, instructors, and academic information.'
                    }
                  </p>
                </div>
                
                {courses.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-sm font-semibold border border-indigo-100 dark:border-indigo-800/30">
                      {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-800/30">
                      {totalCredits} Credits
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              {courses.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search courses, codes, or instructors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="enrolled">Active (Enrolled)</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
              )}

              {/* Empty state (No courses at all) */}
              {courses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <BookX size={28} className="text-slate-400" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    Your enrolled courses will appear here once they are assigned by the administration.
                  </p>
                  <button
                    onClick={loadCourses}
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              )}

              {/* Empty state (Search/Filter returned no results) */}
              {courses.length > 0 && filteredCourses.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No courses match your search criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              )}

              {/* Grid */}
              {filteredCourses.length > 0 && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  layout
                >
                  <AnimatePresence>
                    {filteredCourses.map((course, idx) => (
                      <CourseCard 
                        key={course.id} 
                        course={course} 
                        delay={idx * 0.05}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
