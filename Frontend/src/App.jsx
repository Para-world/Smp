import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import CustomCursor from './components/CustomCursor'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import SecuritySettings from './pages/SecuritySettings'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import StudentCourses from './pages/student/StudentCourses'
import CourseDetail from './pages/student/CourseDetail'
import StudentAttendance from './pages/student/StudentAttendance'
import CourseAttendanceDetail from './pages/student/CourseAttendanceDetail'
import StudentAssignments from './pages/student/StudentAssignments'
import AssignmentDetail from './pages/student/AssignmentDetail'
import StudentTimetable from './pages/student/StudentTimetable'
import StudentExams from './pages/student/StudentExams'
import ExamDetail from './pages/student/ExamDetail'
import StudentResults from './pages/student/StudentResults'
import ResultDetail from './pages/student/ResultDetail'
import StudentAnnouncements from './pages/student/StudentAnnouncements'
import AnnouncementDetail from './pages/student/AnnouncementDetail'
import StudentNotifications from './pages/student/StudentNotifications'
import StudentSettings from './pages/student/StudentSettings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminStudentDetail from './pages/admin/AdminStudentDetail'
import AdminStudentCreate from './pages/admin/AdminStudentCreate'
import AdminInstructors from './pages/admin/AdminInstructors'
import AdminInstructorDetail from './pages/admin/AdminInstructorDetail'
import AdminCourses from './pages/admin/AdminCourses'
import AdminCourseDetail from './pages/admin/AdminCourseDetail'
import AdminEnrollments from './pages/admin/AdminEnrollments'
import AdminAttendance from './pages/admin/AdminAttendance'
import FacultyAttendanceMarking from './pages/faculty/FacultyAttendanceMarking'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050811] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[40px] animate-spin">
            progress_activity
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return children
}

// Student-only route wrapper
function StudentRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050811] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[40px] animate-spin">
            progress_activity
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // If user is not a student, redirect to the general dashboard
  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Admin-only route wrapper
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050811] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[40px] animate-spin">
            progress_activity
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Faculty-only route wrapper
function FacultyRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050811] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[40px] animate-spin">
            progress_activity
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (user?.role !== 'faculty') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Smart redirect based on role
function DashboardRedirect() {
  const { user } = useAuth()

  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />
  }

  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (user?.role === 'faculty') {
    return <Navigate to="/faculty/dashboard" replace />
  }

  return <Navigate to="/student/dashboard" replace />
}

function AppContent() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="bg-slate-50 dark:bg-[#050811] font-body-md text-body-md text-slate-800 dark:text-slate-300 antialiased transition-colors duration-300 min-h-screen">
      <CustomCursor />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <StudentRoute>
              <StudentProfile />
            </StudentRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <StudentRoute>
              <StudentCourses />
            </StudentRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <StudentRoute>
              <CourseDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <StudentRoute>
              <StudentAttendance />
            </StudentRoute>
          }
        />
        <Route
          path="/student/attendance/:courseId"
          element={
            <StudentRoute>
              <CourseAttendanceDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <StudentRoute>
              <StudentAssignments />
            </StudentRoute>
          }
        />
        <Route
          path="/student/assignments/:assignmentId"
          element={
            <StudentRoute>
              <AssignmentDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/student/timetable"
          element={
            <StudentRoute>
              <StudentTimetable />
            </StudentRoute>
          }
        />
        <Route
          path="/student/exams"
          element={
            <StudentRoute>
              <StudentExams />
            </StudentRoute>
          }
        />
        <Route
          path="/student/exams/:examId"
          element={
            <StudentRoute>
              <ExamDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <StudentRoute>
              <StudentResults />
            </StudentRoute>
          }
        />
        <Route
          path="/student/results/:resultId"
          element={
            <StudentRoute>
              <ResultDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/student/announcements"
          element={
            <StudentRoute>
              <StudentAnnouncements />
            </StudentRoute>
          }
        />
        <Route
          path="/student/announcements/:announcementId"
          element={
            <StudentRoute>
              <AnnouncementDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <StudentRoute>
              <StudentNotifications />
            </StudentRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <StudentRoute>
              <StudentSettings />
            </StudentRoute>
          }
        />


        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <SecuritySettings />
            </ProtectedRoute>
          }
        />
        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <AdminStudents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students/create"
          element={
            <AdminRoute>
              <AdminStudentCreate />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <AdminRoute>
              <AdminStudentDetail />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/instructors"
          element={
            <AdminRoute>
              <AdminInstructors />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/instructors/:instructorId"
          element={
            <AdminRoute>
              <AdminInstructorDetail />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <AdminCourses />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId"
          element={
            <AdminRoute>
              <AdminCourseDetail />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/enrollments"
          element={
            <AdminRoute>
              <AdminEnrollments />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/attendance"
          element={
            <AdminRoute>
              <AdminAttendance />
            </AdminRoute>
          }
        />

        {/* Faculty Routes */}
        <Route
          path="/faculty/courses/:courseId/attendance"
          element={
            <FacultyRoute>
              <FacultyAttendanceMarking />
            </FacultyRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
