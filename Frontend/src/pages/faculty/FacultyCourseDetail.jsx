import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFacultyCourseById } from '../../services/facultyApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, ClipboardCheck, Calendar, BookOpen, Bell, FileSignature, BarChart } from 'lucide-react';
import { toast } from 'sonner';

export default function FacultyCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyCourseById(courseId);
      setCourse(data);
    } catch (error) {
      toast.error('Failed to load course details');
      navigate('/faculty/dashboard');
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

  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">Course Code: {course.code} &bull; Credits: {course.credits}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <BookOpen size={16} />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <Users size={16} />
            <span className="text-xs">Students</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <ClipboardCheck size={16} />
            <span className="text-xs">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <ClipboardCheck size={16} />
            <span className="text-xs">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <FileSignature size={16} />
            <span className="text-xs">Exams</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <BarChart size={16} />
            <span className="text-xs">Results</span>
          </TabsTrigger>
          <TabsTrigger value="timetable" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <Calendar size={16} />
            <span className="text-xs">Timetable</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <Bell size={16} />
            <span className="text-xs">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Course Description</h2>
              <p className="text-slate-600 dark:text-slate-300">
                {course.description || "No description provided for this course."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="students" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <Users size={48} className="mb-4 opacity-20" />
              <p>Student roster will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <ClipboardCheck size={48} className="mb-4 opacity-20" />
              <p>Attendance records and marking interface will be here.</p>
              <Button onClick={() => navigate('/faculty/attendance')} variant="outline" className="mt-4">Go to Attendance Module</Button>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <ClipboardCheck size={48} className="mb-4 opacity-20" />
              <p>Assignments for this course will be managed here.</p>
              <Button onClick={() => navigate('/faculty/assignments')} variant="outline" className="mt-4">Go to Assignments Module</Button>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <FileSignature size={48} className="mb-4 opacity-20" />
              <p>Exams for this course will be scheduled here.</p>
              <Button onClick={() => navigate('/faculty/exams')} variant="outline" className="mt-4">Go to Exams Module</Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <BarChart size={48} className="mb-4 opacity-20" />
              <p>Student results and grading analytics will be here.</p>
            </div>
          </TabsContent>

          <TabsContent value="timetable" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p>Course schedule and timetable will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="m-0">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center py-12 text-slate-500">
              <Bell size={48} className="mb-4 opacity-20" />
              <p>Course specific announcements will be managed here.</p>
              <Button onClick={() => navigate('/faculty/announcements')} variant="outline" className="mt-4">Go to Announcements Module</Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
