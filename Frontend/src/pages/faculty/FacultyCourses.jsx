import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFacultyCourses } from '../../services/facultyApi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // NOTE: fetchFacultyCourses might need to be exported in facultyApi.js if it isn't already
      const data = await fetchFacultyCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage all the courses assigned to you.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-dashed rounded-xl p-12 text-center text-slate-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Courses Assigned</h3>
          <p>You have not been assigned to teach any courses yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow bg-white dark:bg-[#1E293B]">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-1 rounded-full uppercase tracking-wider">
                    {course.code}
                  </span>
                  {course.isActive ? (
                    <span className="flex h-2 w-2 rounded-full bg-green-500" title="Active"></span>
                  ) : (
                    <span className="flex h-2 w-2 rounded-full bg-slate-300" title="Inactive"></span>
                  )}
                </div>
                <CardTitle className="text-xl leading-tight">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="py-4 flex-1">
                <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-slate-400" />
                    <span>Credits: {course.credits}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <Link to={`/faculty/courses/${course.id}`} className="w-full">
                  <Button className="w-full justify-between" variant="outline">
                    Manage Course
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
