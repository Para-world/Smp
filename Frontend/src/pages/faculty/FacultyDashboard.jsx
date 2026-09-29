import React, { useState, useEffect } from 'react';
import { fetchFacultyDashboard } from '../../services/facultyApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, ClipboardCheck, Calendar, Bell, FileSignature } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function FacultyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyDashboard();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's an overview of your courses and tasks.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Main Stat Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.courses || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Active courses this semester</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.students || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Enrolled across all courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingGrading || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Submissions to review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todaysClasses || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Scheduled for today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-primary">Upcoming Exams</CardTitle>
                <FileSignature className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.upcomingExams || 0}</div>
                <p className="text-xs text-primary/70 mt-1">Exams scheduled soon</p>
              </CardContent>
            </Card>
          </div>

          {/* Announcements Section */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-slate-500" />
                  Recent Announcements
                </CardTitle>
                <CardDescription>Important updates for faculty</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentAnnouncements?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{announcement.title}</h4>
                          <span className="text-xs text-slate-500 bg-white dark:bg-slate-700 px-2 py-1 rounded-full border">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {announcement.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                    <p>No recent announcements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
