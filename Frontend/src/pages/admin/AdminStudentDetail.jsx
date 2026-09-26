import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Edit2, UserX, Mail, Phone, MapPin, 
  BookOpen, Award, ClipboardCheck, Calendar
} from 'lucide-react';
import { fetchAdminStudentDetails } from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminStudentDetail() {
  const { studentId } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const result = await fetchAdminStudentDetails(studentId);
        setStudent(result);
      } catch (err) {
        setError(err.message || 'Unable to load student details');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [studentId]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic' },
    { id: 'courses', label: 'Courses' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'exams', label: 'Exams' },
    { id: 'results', label: 'Results' },
    { id: 'activity', label: 'Activity' }
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
          pageTitle="Student Profile"
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
              <Link to="/admin/students" className="text-sm underline mt-2 block">Back to Students</Link>
            </div>
          ) : student && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -z-10" />
                
                <div className="flex items-center gap-5 z-10">
                  <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl shadow-sm border-2 border-white dark:border-slate-800 overflow-hidden">
                    {student.user.avatarUrl ? (
                      <img src={student.user.avatarUrl} alt={student.user.name} className="w-full h-full object-cover" />
                    ) : (
                      student.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      {student.user.name}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        student.user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {student.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{student.profile?.program} • Semester {student.profile?.semester}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto z-10">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Edit Profile
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                    <UserX size={16} /> {student.user.isActive ? 'Deactivate' : 'Activate'}
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
                        layoutId="activeTabAdmin"
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
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/50">Personal Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{student.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{student.user.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {student.profile?.address ? `${student.profile.address}, ${student.profile.city || ''}` : 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Academic Summary */}
                      <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/50">Academic Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Enrolled Program</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{student.profile?.program || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Semester</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{student.profile?.semester || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Academic Year</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{student.profile?.academicYear || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Enrollment Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {student.profile?.enrollmentDate ? new Date(student.profile.enrollmentDate).toLocaleDateString() : 'N/A'}
                            </p>
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
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 capitalize">{activeTab} Details</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Detailed {activeTab} information will be populated dynamically from relationships. 
                        Architecture for extending these modules is fully set up via backend joins.
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
