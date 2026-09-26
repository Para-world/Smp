import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAssignmentSubmissions, gradeSubmission } from '../../services/facultyApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Search, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FacultyAssignmentDetail() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await fetchAssignmentSubmissions(assignmentId);
      setSubmissions(data);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeDialog = (sub) => {
    setSelectedSubmission(sub);
    setGradeData({
      score: sub.score || '',
      feedback: sub.feedback || '',
    });
    setIsGradingOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradeData.score) {
      toast.error('Score is required');
      return;
    }

    try {
      setSubmittingGrade(true);
      await gradeSubmission(assignmentId, selectedSubmission.studentId, gradeData);
      toast.success('Grade saved successfully');
      setIsGradingOpen(false);
      loadSubmissions(); // Reload to get updated grade
    } catch (error) {
      toast.error(error.message || 'Failed to save grade');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/faculty/assignments">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignment Submissions</h1>
            <p className="text-slate-500 dark:text-slate-400">Review and grade student work</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search students..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Submitted At</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div>{sub.studentName}</div>
                      <div className="text-xs text-slate-500 font-normal">{sub.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === 'graded' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" /> Graded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.submittedAt ? format(new Date(sub.submittedAt), 'MMM d, h:mm a') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {sub.score !== null ? sub.score : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {sub.fileUrl && (
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" /> View
                            </Button>
                          </a>
                        )}
                        <Button size="sm" onClick={() => handleOpenGradeDialog(sub)}>
                          {sub.score !== null ? 'Edit Grade' : 'Grade'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg text-sm space-y-2 mb-2">
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Student:</span>
              <span className="col-span-2 font-semibold text-slate-900 dark:text-white">{selectedSubmission?.studentName}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Assignment:</span>
              <span className="col-span-2 font-semibold text-slate-900 dark:text-white">{assignment?.title}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Maximum Marks:</span>
              <span className="col-span-2 font-semibold text-slate-900 dark:text-white">{assignment?.maxScore || '100'}</span>
            </div>
          </div>
          <form onSubmit={handleGradeSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="score" className="font-semibold text-slate-700 dark:text-slate-300">Marks</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max={assignment?.maxScore || 100}
                  step="0.1"
                  value={gradeData.score}
                  onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback" className="font-semibold text-slate-700 dark:text-slate-300">Feedback</Label>
                <Textarea
                  id="feedback"
                  rows={4}
                  placeholder="Provide constructive feedback..."
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsGradingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingGrade}>
                {submittingGrade ? 'Saving...' : 'Save Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
