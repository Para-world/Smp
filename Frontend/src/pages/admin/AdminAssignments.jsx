import React, { useState, useEffect } from 'react';
import { fetchAdminAssignments } from '../../services/adminApi';
import AdminHeader from '../../components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAssignments({ mobileOpen, setMobileOpen }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminAssignments();
      setAssignments(data);
    } catch (error) {
      toast.error(error.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${
        mobileOpen ? 'overflow-hidden h-screen' : ''
      }`}
    >
      <AdminHeader
        pageTitle="Assignment Overview"
        onMenuClick={() => setMobileOpen(true)}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
            <p className="text-slate-500 dark:text-slate-400">Institutional overview of all assignments (Read-only)</p>
          </div>
          <div className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/50 max-w-sm">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>Assignment creation and grading is strictly managed by Faculty via their portal.</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : assignments.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <CardTitle className="mb-2">No assignments found</CardTitle>
            <CardDescription>There are currently no assignments across any courses.</CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map(assignment => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg line-clamp-1" title={assignment.title}>{assignment.title}</CardTitle>
                      <CardDescription className="font-medium text-blue-600 dark:text-blue-400 mt-1">
                        {assignment.courseCode} - {assignment.courseTitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Score:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{assignment.maxScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {assignment.dueDate ? format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a') : 'No Due Date'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
