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

// Smart redirect based on role
function DashboardRedirect() {
  const { user } = useAuth()

  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />
  }

  // Non-student roles go to the generic dashboard
  return <Dashboard />
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
        {/* Placeholder routes for student sub-pages — will render the dashboard layout */}
        {[
          'profile', 'courses', 'attendance', 'assignments',
          'exams', 'results', 'timetable', 'announcements',
          'notifications', 'settings'
        ].map((page) => (
          <Route
            key={page}
            path={`/student/${page}`}
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />
        ))}

        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <SecuritySettings />
            </ProtectedRoute>
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
