import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFacultyAssignments } from '../../services/facultyApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { FileText, Plus, Users, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyAssignments();
      setAssignments(data);
    } catch (error) {
      toast.error(error.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage assignments across your courses</p>
        </div>
        <Link to="/faculty/assignments/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Assignment
          </Button>
        </Link>
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
          <h3 className="text-xl font-medium mb-2">No Assignments Created</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
            You haven't created any assignments for your courses yet. Click the button below to get started.
          </p>
          <Link to="/faculty/assignments/create">
            <Button>Create Your First Assignment</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map(assignment => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1 line-clamp-1">{assignment.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-sm font-medium text-primary/80">
                      <span className="bg-primary/10 px-2 py-0.5 rounded text-xs">{assignment.courseCode}</span>
                      <span className="truncate max-w-[120px]">{assignment.courseTitle}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4 mr-2 opacity-70" />
                    <span>Due: {assignment.dueDate ? format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a') : 'No Due Date'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <FileText className="h-4 w-4 mr-2 opacity-70" />
                    <span>Max Marks: {assignment.maxScore}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to={`/faculty/assignments/${assignment.id}`} className="block w-full">
                    <Button variant="outline" className="w-full justify-between">
                      View Submissions
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
