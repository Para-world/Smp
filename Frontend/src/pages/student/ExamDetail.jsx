import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, MapPin, Calendar, BookOpen, 
  User, Video, AlertTriangle, FileCheck, HelpCircle
} from 'lucide-react';
import { isBefore, isAfter, parseISO, parse, isSameDay } from 'date-fns';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import DashboardSkeleton from '../../components/student/DashboardSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchExamDetail } from '../../services/studentApi';
import { cn } from '@/lib/utils';

// Helper for status
function getExamStatus(examDateStr, startTimeStr, endTimeStr, backendStatus) {
  if (backendStatus === 'CANCELLED' || backendStatus === 'POSTPONED') return backendStatus;
  
  const now = new Date();
  const examDate = parseISO(examDateStr);
  
  if (!isSameDay(examDate, now)) {
    return isBefore(examDate, now) ? 'COMPLETED' : 'UPCOMING';
  }

  const startObj = parse(startTimeStr, 'HH:mm', examDate);
  const endObj = parse(endTimeStr, 'HH:mm', examDate);

  if (isAfter(now, endObj)) return 'COMPLETED';
  if (isBefore(now, startObj)) return 'UPCOMING';
  return 'ONGOING';
}

const statusStyles = {
  UPCOMING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ONGOING: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse',
  COMPLETED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  POSTPONED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const formatType = (type) => type?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Exam';

export default function ExamDetail() {
  const { examId } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExamDetail(examId);
      data.actualStatus = getExamStatus(data.date, data.startTime, data.endTime, data.status);
      setExam(data);
    } catch (err) {
      setError(err.message || 'Unable to load exam details.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Exam Details" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1000px] mx-auto space-y-6">
          <Link to="/student/exams" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Exams
          </Link>

          {loading && <DashboardSkeleton />}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <AlertTriangle size={32} className="text-red-500 mb-4" />
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Unable to load exam</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          )}

          {!loading && exam && (
            <>
              {/* Exam Header */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900/50">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                      <FileCheck size={160} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="secondary" className={cn("uppercase tracking-wider text-[10px] font-bold border-none", 
                          exam.actualStatus === 'UPCOMING' ? 'bg-white/20 text-white' : statusStyles[exam.actualStatus]
                        )}>
                          {exam.actualStatus}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-none uppercase text-[10px] tracking-wider">
                          {formatType(exam.examType)}
                        </Badge>
                        {exam.isOnline && (
                          <Badge variant="secondary" className="bg-indigo-500 text-white border-none uppercase text-[10px] tracking-wider gap-1">
                            <Video size={12} /> Online
                          </Badge>
                        )}
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">{exam.courseTitle}</h1>
                      <p className="text-indigo-100 text-lg font-mono mb-4">{exam.courseCode}</p>
                      <h2 className="text-xl font-medium text-white/90">{exam.title}</h2>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Status Banner for Cancelled/Postponed */}
                  {(exam.actualStatus === 'CANCELLED' || exam.actualStatus === 'POSTPONED') && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <div className={cn(
                        "p-5 rounded-xl border flex gap-4",
                        exam.actualStatus === 'CANCELLED' ? "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800" : "bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800"
                      )}>
                        <AlertTriangle className={exam.actualStatus === 'CANCELLED' ? "text-red-500" : "text-amber-500"} size={24} />
                        <div>
                          <h3 className={cn("font-semibold text-lg mb-1", exam.actualStatus === 'CANCELLED' ? "text-red-800 dark:text-red-400" : "text-amber-800 dark:text-amber-400")}>
                            Exam {formatType(exam.actualStatus)}
                          </h3>
                          {exam.cancellationReason && (
                            <p className={exam.actualStatus === 'CANCELLED' ? "text-red-600 dark:text-red-300 text-sm" : "text-amber-700 dark:text-amber-300 text-sm"}>
                              {exam.cancellationReason}
                            </p>
                          )}
                          {exam.actualStatus === 'POSTPONED' && exam.originalDate && (
                            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                              Original Date: <span className="font-semibold">{new Date(exam.originalDate).toLocaleDateString()}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <CardTitle className="text-lg font-display flex items-center gap-2">
                          <Info size={18} className="text-indigo-500" />
                          Exam Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Calendar size={14} /> Date</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white">
                              {new Date(exam.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Clock size={14} /> Time & Duration</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white">
                              {exam.startTime} – {exam.endTime} <span className="text-slate-400">({exam.durationMinutes} mins)</span>
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><BookOpen size={14} /> Description</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {exam.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <CardTitle className="text-lg font-display flex items-center gap-2">
                          <HelpCircle size={18} className="text-emerald-500" />
                          Instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {exam.instructions ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            {exam.instructions.split('\n').map((line, i) => (
                              <p key={i} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No specific instructions have been provided for this examination.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Right Column - Venue & Actions */}
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card>
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-slate-50/50 dark:bg-slate-900/20">
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          <MapPin size={16} className="text-indigo-500" />
                          Venue
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4">
                        {!exam.isOnline ? (
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Room</p>
                              <p className="text-base font-medium text-slate-900 dark:text-white">{exam.venue || 'TBA'}</p>
                            </div>
                            {exam.building && (
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Building</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{exam.building}</p>
                              </div>
                            )}
                            {exam.floor && (
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Floor</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{exam.floor}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 text-center py-2">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600 dark:text-indigo-400">
                              <Video size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Online Examination</p>
                            {exam.examUrl ? (
                              <a href={exam.examUrl} target="_blank" rel="noreferrer" className="block w-full">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Join Exam Link</Button>
                              </a>
                            ) : (
                              <p className="text-xs text-slate-500">Link will be available closer to the exam time.</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card>
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-slate-50/50 dark:bg-slate-900/20">
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          <User size={16} className="text-slate-500" />
                          Coordinator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{exam.facultyName || 'TBA'}</p>
                        <p className="text-xs text-slate-500 mt-1">Course Instructor</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
