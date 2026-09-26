import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Edit2, UserX, Mail, Phone, MapPin, 
  BookOpen, Calendar
} from 'lucide-react';
import { fetchAdminInstructorDetails } from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminInstructorDetail() {
  const { instructorId } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const result = await fetchAdminInstructorDetails(instructorId);
        setInstructor(result);
      } catch (err) {
        setError(err.message || 'Unable to load instructor details');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [instructorId]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Assigned Courses' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'activity', label: 'Recent Activity' }
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
          pageTitle="Instructor Profile"
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
              <Link to="/admin/instructors" className="text-sm underline mt-2 block">Back to Instructors</Link>
            </div>
          ) : instructor && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl -z-10" />
                
                <div className="flex items-center gap-5 z-10">
                  <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl shadow-sm border-2 border-white dark:border-slate-800 overflow-hidden">
                    {instructor.user.avatarUrl ? (
                      <img src={instructor.user.avatarUrl} alt={instructor.user.name} className="w-full h-full object-cover" />
                    ) : (
                      instructor.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      {instructor.user.name}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        instructor.user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {instructor.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Instructor • Joined {new Date(instructor.user.createdAt).getFullYear()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto z-10">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Edit Profile
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                    <UserX size={16} /> {instructor.user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap relative ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabInstructor"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Info */}
                      <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/50">Contact Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{instructor.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{instructor.user.phone || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab !== 'overview' && (
                    <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-slate-400" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 capitalize">{activeTab}</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        This view will display detailed {activeTab} information related to the instructor.
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
