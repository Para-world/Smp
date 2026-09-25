import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, BookOpen, Clock, Calendar, GraduationCap, MapPin, CheckCircle2, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { fetchStudentCourseDetails } from '../../services/studentApi';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import CourseDetailSkeleton from '../../components/student/courses/CourseDetailSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusColor = {
  enrolled: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dropped: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  waitlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const statusLabel = {
  enrolled: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
  waitlisted: 'Waitlisted',
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
        <Icon size={16} className="text-slate-500 dark:text-slate-400" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentCourseDetails(courseId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to load course details.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const course = data?.course;
  const assignments = data?.assignments || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Course Details" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1200px] mx-auto">
          {loading && <CourseDetailSkeleton />}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Course Not Found or Access Denied
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate('/student/courses')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to My Courses
              </button>
            </motion.div>
          )}

          {!loading && !error && course && (
            <div className="space-y-6">
              {/* Back Link */}
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Courses
              </Link>

              {/* Banner / Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="overflow-hidden">
                  <div className="h-24 sm:h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  </div>
                  <CardContent className="px-6 py-6 pt-0 relative">
                    <div className="-mt-10 sm:-mt-12 mb-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-[#0B1120] p-1.5 shadow-lg border border-slate-100 dark:border-slate-800">
                        <div className="w-full h-full rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-display font-bold text-xl sm:text-2xl">
                          {course.code.split('-')[0] || 'CR'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {course.title}
                        </h1>
                        <p className="text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {course.code}
                        </p>
                      </div>
                      <Badge variant="secondary" className={`text-xs px-3 py-1 ${statusColor[course.enrollmentStatus] || ''}`}>
                        {statusLabel[course.enrollmentStatus] || course.enrollmentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Overview */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <Card>
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-display flex items-center gap-2">
                          <BookOpen size={18} className="text-indigo-500" />
                          Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {course.description || "No description provided for this course."}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Materials / Assignments placeholders */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                    <Card>
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-display flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-emerald-500" />
                            Recent Assignments
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 p-0">
                        {assignments.length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {assignments.map(a => (
                              <Link 
                                to={`/student/assignments/${a.id}`} 
                                key={a.id} 
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                              >
                                <div>
                                  <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.title}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Due: {a.dueDate ? format(new Date(a.dueDate), 'MMM d, yyyy') : 'No due date'}
                                  </p>
                                </div>
                                <Badge variant="outline" className="w-fit text-xs font-mono bg-white dark:bg-slate-900">{a.maxScore} pts</Badge>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            No active assignments for this course.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  
                  {/* Instructor */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                    <Card>
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-base font-display">Instructor</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {course.faculty ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700">
                              <AvatarImage src={course.faculty.avatarUrl} alt={course.faculty.name} />
                              <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {course.faculty.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{course.faculty.name}</p>
                              {course.faculty.email && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{course.faculty.email}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <User size={16} /> Instructor TBA
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Information */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
                    <Card>
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-base font-display">Course Information</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-5">
                        <InfoRow icon={GraduationCap} label="Credits" value={`${course.credits} Credits`} />
                        <InfoRow icon={Calendar} label="Semester" value={`${course.semester?.name || 'TBA'} ${course.semester?.academicYear ? `(${course.semester.academicYear})` : ''}`} />
                        {course.schedule && <InfoRow icon={Clock} label="Schedule" value={course.schedule} />}
                        {course.location && <InfoRow icon={MapPin} label="Location" value={course.location} />}
                        {course.department?.name && <InfoRow icon={CheckCircle2} label="Department" value={course.department.name} />}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
