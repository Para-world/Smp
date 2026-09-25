import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, CheckCircle2, Clock, FileWarning, Calendar,
  AlertTriangle, Upload, Send, MessageSquare
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { fetchAssignmentDetails, submitAssignment } from '../../services/studentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function AssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadAssignment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAssignmentDetails(assignmentId);
      setData(res);
      if (res.submission?.content) {
        setSubmissionText(res.submission.content);
      }
    } catch (err) {
      setError(err.message || 'Unable to load assignment details.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    setSubmitting(true);
    try {
      await submitAssignment(assignmentId, { content: submissionText });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      await loadAssignment(); // Reload to get updated status
    } catch (err) {
      alert(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const assignment = data?.assignment;
  const submission = data?.submission;
  const grade = data?.grade;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'submitted':
      case 'graded':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> {status === 'graded' ? 'Graded' : 'Submitted'}</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white"><FileWarning className="w-3.5 h-3.5 mr-1.5"/> Overdue</Badge>;
      case 'pending':
      case 'late':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white"><Clock className="w-3.5 h-3.5 mr-1.5"/> {status === 'late' ? 'Late Submission' : 'Pending'}</Badge>;
      default:
        return null;
    }
  };

  const isPastDue = assignment?.dueDate && new Date(assignment.dueDate) < new Date();
  const canSubmit = !grade && assignment; // Can submit if not graded

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Assignment Details" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1000px] mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><span className="material-symbols-outlined text-indigo-600 animate-spin text-4xl">progress_activity</span></div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Assignment</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{error}</p>
              <Button onClick={() => navigate('/student/assignments')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assignments
              </Button>
            </motion.div>
          ) : assignment && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back Link */}
              <Link
                to="/student/assignments"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Back to Assignments
              </Link>

              {/* Header */}
              <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className="font-mono bg-slate-50 dark:bg-slate-800">{assignment.courseCode}</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">{assignment.type}</Badge>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight mb-2">
                      {assignment.title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{assignment.courseTitle}</p>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <div className="text-center md:text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Max Score</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{assignment.maxScore}</p>
                    </div>
                    <div className="w-px h-8 md:w-full md:h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-center md:text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Weight</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{assignment.weight}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Calendar size={18} className={isPastDue && assignment.status !== 'submitted' && assignment.status !== 'graded' ? 'text-red-500' : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</p>
                      <p className={cn("text-sm font-semibold", isPastDue && assignment.status !== 'submitted' && assignment.status !== 'graded' ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white")}>
                        {assignment.dueDate ? format(new Date(assignment.dueDate), 'PPP p') : 'No Due Date'}
                        {assignment.dueDate && assignment.status === 'pending' && (
                          <span className="text-xs font-normal ml-2 text-slate-500">
                            ({formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Instructions */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-display">
                        <FileText size={20} className="text-indigo-500" />
                        Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                        {assignment.description ? (
                          <p className="whitespace-pre-wrap">{assignment.description}</p>
                        ) : (
                          <p className="text-slate-500 italic">No specific instructions provided.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submission Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-display">
                        <Upload size={20} className="text-indigo-500" />
                        {submission ? 'Your Submission' : 'Submit Assignment'}
                      </CardTitle>
                      {submission && (
                        <CardDescription>
                          Submitted on {format(new Date(submission.submittedAt), 'PPP p')}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {grade ? (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                            {submission?.content || 'No text content.'}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <Textarea 
                            placeholder="Type your submission here, or provide a link to your work..."
                            className="min-h-[200px] resize-y bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            disabled={submitting}
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {submission ? 'Resubmitting will overwrite your previous work.' : 'Make sure you review your work before submitting.'}
                            </p>
                            <Button 
                              type="submit" 
                              disabled={!submissionText.trim() || submitting}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                              {submitting ? (
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                              ) : (
                                <Send size={16} />
                              )}
                              {submission ? 'Resubmit' : 'Submit'}
                            </Button>
                          </div>
                          {submitSuccess && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-sm text-emerald-600 font-medium text-right"
                            >
                              Successfully submitted!
                            </motion.p>
                          )}
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Feedback / Grade */}
                <div className="space-y-6">
                  <Card className={cn(
                    "border-2", 
                    grade ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-slate-100 dark:border-slate-800"
                  )}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-display">
                        <CheckCircle2 size={20} className={grade ? "text-emerald-500" : "text-slate-400"} />
                        Grade & Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {grade ? (
                        <div className="space-y-5">
                          <div className="flex flex-col items-center justify-center py-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Final Score</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">{grade.score}</span>
                              <span className="text-xl font-medium text-slate-400">/ {assignment.maxScore}</span>
                            </div>
                          </div>
                          
                          {grade.feedback && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <MessageSquare size={14} className="text-indigo-500"/>
                                Instructor Feedback
                              </h4>
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 italic">
                                "{grade.feedback}"
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                            <Clock size={24} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Not Graded Yet</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                            {submission ? 'Your submission is waiting to be reviewed.' : 'Submit your assignment to get a grade.'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
