import React, { useState, useEffect } from 'react';
import { fetchCourseResults, saveCourseResults } from '../../services/facultyApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BarChart, Save, Send } from 'lucide-react';

export default function FacultyCourseResults({ courseId }) {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResults();
  }, [courseId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseResults(courseId);
      setStudentsData(data.map(item => ({
        studentId: item.student.id,
        name: item.student.name,
        email: item.student.email,
        internalMarks: item.result?.internalMarks ?? '',
        externalMarks: item.result?.externalMarks ?? '',
        practicalMarks: item.result?.practicalMarks ?? '',
        totalMarks: item.result?.totalMarks ?? '',
        grade: item.result?.grade ?? '',
        gradePoint: item.result?.gradePoint ?? '',
        status: item.result?.status || 'NOT_CREATED',
      })));
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (studentId, field, value) => {
    setStudentsData(prev => prev.map(student => {
      if (student.studentId === studentId) {
        return { ...student, [field]: value };
      }
      return student;
    }));
  };

  const handleSave = async (action = 'save_draft') => {
    try {
      setSaving(true);
      const resultsToSave = studentsData.map(s => ({
        studentId: s.studentId,
        internalMarks: s.internalMarks === '' ? undefined : s.internalMarks,
        externalMarks: s.externalMarks === '' ? undefined : s.externalMarks,
        practicalMarks: s.practicalMarks === '' ? undefined : s.practicalMarks,
        totalMarks: s.totalMarks === '' ? undefined : s.totalMarks,
        grade: s.grade,
        gradePoint: s.gradePoint === '' ? undefined : s.gradePoint,
      }));
      
      const res = await saveCourseResults(courseId, resultsToSave, action);
      toast.success(res.message);
      loadResults(); // Reload to get updated status
    } catch (error) {
      toast.error(error.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (studentsData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
        <BarChart size={48} className="mb-4 opacity-20" />
        <p>No students enrolled in this course.</p>
      </div>
    );
  }

  // Check if all are published
  const isAllPublished = studentsData.length > 0 && studentsData.every(s => s.status === 'PUBLISHED');
  // Check if any pending
  const isAnyPending = studentsData.some(s => s.status === 'PENDING_REVIEW');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
        <div>
          <h3 className="font-semibold">Results Entry</h3>
          <p className="text-sm text-slate-500">Enter and review marks for all students</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave('save_draft')} 
            disabled={saving || isAllPublished || isAnyPending}
          >
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button 
            onClick={() => {
              if (window.confirm("Are you sure you want to submit these results for approval? You will not be able to edit them once submitted.")) {
                handleSave('submit_review');
              }
            }} 
            disabled={saving || isAllPublished || isAnyPending}
          >
            <Send className="h-4 w-4 mr-2" /> Submit for Approval
          </Button>
        </div>
      </div>

      {(isAllPublished || isAnyPending) && (
        <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          {isAllPublished ? 
            "These results have been published and can no longer be edited." : 
            "These results are currently pending review and cannot be edited until reviewed by an admin."
          }
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 w-28">Internal</th>
                <th className="px-4 py-3 w-28">External</th>
                <th className="px-4 py-3 w-28">Practical</th>
                <th className="px-4 py-3 w-28">Total</th>
                <th className="px-4 py-3 w-24">Grade</th>
                <th className="px-4 py-3 w-24">GP</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentsData.map((student) => {
                const disabled = student.status === 'PUBLISHED' || student.status === 'PENDING_REVIEW';
                
                return (
                  <tr key={student.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="number" 
                        value={student.internalMarks} 
                        onChange={e => handleInputChange(student.studentId, 'internalMarks', e.target.value)}
                        className="h-8"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="number" 
                        value={student.externalMarks} 
                        onChange={e => handleInputChange(student.studentId, 'externalMarks', e.target.value)}
                        className="h-8"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="number" 
                        value={student.practicalMarks} 
                        onChange={e => handleInputChange(student.studentId, 'practicalMarks', e.target.value)}
                        className="h-8"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="number" 
                        value={student.totalMarks} 
                        onChange={e => handleInputChange(student.studentId, 'totalMarks', e.target.value)}
                        className="h-8 font-medium"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="text" 
                        value={student.grade} 
                        onChange={e => handleInputChange(student.studentId, 'grade', e.target.value)}
                        className="h-8 text-center font-bold"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="number" 
                        step="0.1"
                        value={student.gradePoint} 
                        onChange={e => handleInputChange(student.studentId, 'gradePoint', e.target.value)}
                        className="h-8"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {student.status === 'PUBLISHED' && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Published</span>
                      )}
                      {student.status === 'PENDING_REVIEW' && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Pending</span>
                      )}
                      {(student.status === 'DRAFT' || student.status === 'NOT_CREATED') && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">Draft</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
