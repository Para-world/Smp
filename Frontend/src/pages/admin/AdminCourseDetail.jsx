import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Edit2, Archive, Users, UserCheck, 
  BookOpen, Calendar, ClipboardCheck, FileText, Award, Megaphone
} from 'lucide-react';
import { fetchAdminCourseDetails } from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminCourseDetail() {
  const { courseId } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const result = await fetchAdminCourseDetails(courseId);
        setCourseData(result.course);
      } catch (err) {
        setError(err.message || 'Unable to load course details');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [courseId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'instructor', label: 'Instructor', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ];

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
          pageTitle="Course Details"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-blue-500 text-[40px] animate-spin">progress_activity</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
              <p className="font-semibold">{error}</p>
              <Link to="/admin/courses" className="text-sm underline mt-2 block">Back to Courses</Link>
            </div>
          ) : courseData && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl -z-10" />
                
                <div className="flex items-center gap-5 z-10">
                  <div className="h-20 w-20 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border-2 border-white dark:border-slate-800">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      {courseData.title}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        courseData.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {courseData.isActive ? 'Active' : 'Archived'}
                      </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{courseData.code} • {courseData.credits} Credits</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto z-10">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Edit Course
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-medium rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-2">
                    <Archive size={16} /> Archive
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 relative ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabCourse"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        initial={false}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/50">Course Description</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                          {courseData.description || 'No description provided for this course.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab !== 'overview' && (
                    <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-slate-400" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 capitalize">{activeTab} Management</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        This view manages the {activeTab} for this course. Extensions can be added to query the respective APIs.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
