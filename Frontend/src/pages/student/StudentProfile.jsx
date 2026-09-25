import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import ProfileHeader from '../../components/student/profile/ProfileHeader';
import PersonalInformation from '../../components/student/profile/PersonalInformation';
import AcademicInformation from '../../components/student/profile/AcademicInformation';
import ContactInformation from '../../components/student/profile/ContactInformation';
import ProfileCompletion from '../../components/student/profile/ProfileCompletion';
import EditProfileDialog from '../../components/student/profile/EditProfileDialog';
import ProfileSkeleton from '../../components/student/profile/ProfileSkeleton';

import { fetchStudentProfile } from '../../services/studentApi';

export default function StudentProfile() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentProfile();
      setStudent(data.student);
    } catch (err) {
      setError(err.message || 'Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileSaved = () => {
    toast.success('Profile updated successfully');
    loadProfile();
  };

  const handleAvatarUpdated = () => {
    toast.success('Profile photo updated');
    loadProfile();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          className: 'font-sans',
        }}
      />

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
          pageTitle="My Profile"
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {/* Loading */}
          {loading && <ProfileSkeleton />}

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
                Unable to load your profile
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {error}
              </p>
              <button
                onClick={loadProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </motion.div>
          )}

          {/* Profile content */}
          {!loading && !error && student && (
            <div className="space-y-6">
              {/* Profile Header */}
              <ProfileHeader
                student={student}
                onEdit={() => setEditOpen(true)}
                onAvatarUpdated={handleAvatarUpdated}
              />

              {/* Personal Information */}
              <PersonalInformation student={student} />

              {/* Academic Information */}
              <AcademicInformation student={student} />

              {/* Contact + Completion */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContactInformation student={student} />
                <ProfileCompletion student={student} />
              </div>

              {/* Edit dialog */}
              {editOpen && (
                <EditProfileDialog
                  open={editOpen}
                  onOpenChange={setEditOpen}
                  student={student}
                  onSaved={handleProfileSaved}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
