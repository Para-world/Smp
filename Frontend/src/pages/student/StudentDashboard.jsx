import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import WelcomeCard from '../../components/student/WelcomeCard';
import StudentSummary from '../../components/student/StudentSummary';
import DashboardStats from '../../components/student/DashboardStats';
import QuickActions from '../../components/student/QuickActions';
import UpcomingClasses from '../../components/student/UpcomingClasses';
import RecentAnnouncements from '../../components/student/RecentAnnouncements';
import UpcomingAssignments from '../../components/student/UpcomingAssignments';
import DashboardUpcomingExams from '../../components/student/DashboardUpcomingExams';
import AcademicProgress from '../../components/student/AcademicProgress';
import DashboardSkeleton from '../../components/student/DashboardSkeleton';

import { fetchStudentDashboard } from '../../services/studentApi';

export default function StudentDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Unable to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
          pageTitle="Dashboard"
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {/* Loading */}
          {loading && <DashboardSkeleton />}

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
                Unable to load your dashboard
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                Please try again.
              </p>
              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </motion.div>
          )}

          {/* Dashboard content */}
          {!loading && !error && dashboardData && (
            <div className="space-y-6">
              {/* Welcome */}
              <WelcomeCard />

              {/* Student summary */}
              <StudentSummary student={dashboardData.student} />

              {/* Statistics */}
              <DashboardStats statistics={dashboardData.statistics} />

              {/* Quick actions */}
              <QuickActions />

              {/* Four-column section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1">
                  <UpcomingClasses classes={dashboardData.upcomingClasses} />
                </div>
                <div className="xl:col-span-1">
                  <DashboardUpcomingExams exams={dashboardData.upcomingExams} />
                </div>
                <div className="xl:col-span-1">
                  <UpcomingAssignments assignments={dashboardData.pendingAssignmentsList} />
                </div>
                <div className="xl:col-span-1">
                  <RecentAnnouncements announcements={dashboardData.announcements} />
                </div>
              </div>

              {/* Academic progress */}
              <AcademicProgress
                semesterProgress={dashboardData.semesterProgress}
                activeSemester={dashboardData.activeSemester}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
