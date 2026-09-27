import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Bell, Send, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { fetchAdminNotifications, sendAdminNotification, fetchAdminSemesters } from '../../services/adminApi';
import { fetchAdminCourses } from '../../services/adminApi';

export default function AdminNotifications() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [audience, setAudience] = useState('ALL_STUDENTS');
  const [sendEmail, setSendEmail] = useState(true);
  
  // Dynamic fields
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  useEffect(() => {
    loadNotifications();
    loadLookups();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications history');
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [sems, crs] = await Promise.all([
        fetchAdminSemesters().catch(() => []),
        fetchAdminCourses().catch(() => ({ data: [] }))
      ]);
      setSemesters(sems || []);
      setCourses(crs?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !message || !audience) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        title,
        message,
        priority,
        audience,
        sendEmail,
        semesterId: audience === 'SPECIFIC_SEMESTER' ? selectedSemester : undefined,
        courseId: audience === 'SPECIFIC_COURSE' ? selectedCourse : undefined,
        program: audience === 'SPECIFIC_PROGRAM' ? selectedProgram : undefined,
        targetStudentId: audience === 'SPECIFIC_STUDENT' ? targetStudentId : undefined,
      };

      const result = await sendAdminNotification(data);
      toast.success(result.message || 'Notification sent successfully!');
      
      // Reset form
      setTitle('');
      setMessage('');
      
      // Reload history
      loadNotifications();
    } catch (error) {
      toast.error(error.message || 'Failed to send notification');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT': return <Badge variant="destructive">Urgent</Badge>;
      case 'IMPORTANT': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Important</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">Normal</Badge>;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${mobileOpen ? 'overflow-hidden h-screen' : ''}`}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <AdminHeader
          pageTitle="Notifications"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-8">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Broadcast Notifications</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Send system-wide or targeted alerts and emails.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Notification Form */}
            <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm h-fit">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-600" />
                  New Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                      placeholder="Enter notification subject" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea 
                      placeholder="Type your message here..." 
                      className="min-h-[120px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="IMPORTANT">Important</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Audience</label>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                          <SelectItem value="FACULTY">All Faculty</SelectItem>
                          <SelectItem value="SPECIFIC_PROGRAM">Specific Program</SelectItem>
                          <SelectItem value="SPECIFIC_SEMESTER">Specific Semester</SelectItem>
                          <SelectItem value="SPECIFIC_COURSE">Specific Course</SelectItem>
                          <SelectItem value="SPECIFIC_STUDENT">Specific Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Conditional Fields based on Audience */}
                  {audience === 'SPECIFIC_PROGRAM' && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Program Name</label>
                      <Input 
                        placeholder="e.g. BCA, MCA" 
                        value={selectedProgram}
                        onChange={e => setSelectedProgram(e.target.value)}
                      />
                    </div>
                  )}

                  {audience === 'SPECIFIC_SEMESTER' && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Semester</label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger><SelectValue placeholder="Choose a semester" /></SelectTrigger>
                        <SelectContent>
                          {semesters.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {audience === 'SPECIFIC_COURSE' && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Course</label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger><SelectValue placeholder="Choose a course" /></SelectTrigger>
                        <SelectContent>
                          {courses.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {audience === 'SPECIFIC_STUDENT' && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Student ID (UUID)</label>
                      <Input 
                        placeholder="Paste Student UUID" 
                        value={targetStudentId}
                        onChange={e => setTargetStudentId(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <Checkbox 
                      id="sendEmail" 
                      checked={sendEmail} 
                      onCheckedChange={setSendEmail}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="sendEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-900 dark:text-blue-200">
                        Send Copy via Email
                      </label>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        Delivers the notification directly to users' inboxes.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Send className="mr-2 h-4 w-4" /> Broadcast Notification
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* History */}
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-slate-500" />
                  Recent Broadcasts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                ) : notifications.length === 0 ? (
                  <div className="text-center p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No broadcasts found</h3>
                    <p className="text-slate-500">Notifications sent by admins will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                          <TableHead>Notification</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Sent At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notifications.map((notif) => (
                          <TableRow key={notif.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="max-w-[300px]">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</div>
                              <div className="text-sm text-slate-500 truncate" title={notif.message}>{notif.message}</div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(notif.priority)}</TableCell>
                            <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                              {format(new Date(notif.createdAt), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
