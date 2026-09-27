import React, { useState, useEffect } from 'react';
import { fetchAdminTimetable, createAdminTimetable, updateAdminTimetable, deleteAdminTimetable, fetchAdminCourses, fetchAdminInstructors } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Clock, MapPin, User, BookOpen, Trash2, Edit, CalendarDays, Laptop, MonitorPlay } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function AdminTimetable({ mobileOpen, setMobileOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [formData, setFormData] = useState({
    courseId: '',
    instructorId: '',
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    building: '',
    classType: 'lecture',
    isOnline: false,
    meetingUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadDropdowns();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminTimetable();
      setSchedules(data);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        fetchAdminCourses({ limit: 100 }),
        fetchAdminInstructors({ limit: 100 })
      ]);
      setCourses(coursesRes.data || []);
      setInstructors(instRes.data || []);
    } catch (error) {
      toast.error('Failed to load selection lists');
    }
  };

  const openAddDialog = () => {
    setEditingSchedule(null);
    setFormData({
      courseId: '',
      instructorId: '',
      dayOfWeek: '1',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      building: '',
      classType: 'lecture',
      isOnline: false,
      meetingUrl: ''
    });
    setDialogOpen(true);
  };

  const openEditDialog = (sch) => {
    setEditingSchedule(sch);
    setFormData({
      courseId: sch.courseId,
      instructorId: sch.instructorId || '',
      dayOfWeek: sch.dayOfWeek.toString(),
      startTime: sch.startTime,
      endTime: sch.endTime,
      room: sch.room || '',
      building: sch.building || '',
      classType: sch.classType || 'lecture',
      isOnline: sch.isOnline || false,
      meetingUrl: sch.meetingUrl || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class schedule?")) return;
    try {
      await deleteAdminTimetable(id);
      toast.success("Schedule deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId) {
      toast.error('Course is required');
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSchedule) {
        await updateAdminTimetable(editingSchedule.id, formData);
        toast.success('Schedule updated');
      } else {
        await createAdminTimetable(formData);
        toast.success('Schedule created');
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Group schedules by day
  const schedulesByDay = DAYS.map((dayName, index) => {
    return {
      dayIndex: index,
      dayName,
      classes: schedules.filter(s => s.dayOfWeek === index)
    };
  });

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${
        mobileOpen ? 'overflow-hidden h-screen' : ''
      }`}
    >
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <AdminHeader
          pageTitle="Timetable Management"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                  <CalendarDays className="h-6 w-6" />
                </div>
                Master Timetable
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                Create and manage the institution's master class schedule. Changes here instantly reflect on faculty and student portals.
              </p>
            </div>
            <Button onClick={openAddDialog} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all rounded-xl px-6 h-11">
              <Plus className="h-5 w-5" /> Add Class
            </Button>
          </div>

          {/* Timetable View */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-2 sm:p-6">
            <Tabs defaultValue="1" className="w-full">
              <div className="overflow-x-auto pb-2 mb-6 hide-scrollbar">
                <TabsList className="h-12 w-full sm:w-auto inline-flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                  {DAYS.map((day, idx) => (
                    // Skip Sunday in tabs by default unless it has classes, but for simplicity let's show all or just Mon-Sat
                    idx === 0 ? null : (
                      <TabsTrigger 
                        key={idx} 
                        value={idx.toString()}
                        className="rounded-lg px-6 font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all"
                      >
                        {day}
                      </TabsTrigger>
                    )
                  ))}
                </TabsList>
              </div>

              {DAYS.map((dayName, index) => {
                if (index === 0) return null; // Skip Sunday for now
                const dayClasses = schedules.filter(s => s.dayOfWeek === index).sort((a, b) => a.startTime.localeCompare(b.startTime));
                
                return (
                  <TabsContent key={index} value={index.toString()} className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    {dayClasses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                          <CalendarDays className="h-10 w-10 text-blue-300 dark:text-blue-700" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Classes Scheduled</h3>
                        <p className="text-slate-500 dark:text-slate-500 max-w-sm mb-6">There are no classes scheduled for {dayName}. Enjoy the free time or add a new class!</p>
                        <Button variant="outline" onClick={() => { setFormData(prev => ({...prev, dayOfWeek: index.toString()})); setDialogOpen(true); }} className="rounded-xl border-dashed">
                          <Plus className="h-4 w-4 mr-2" /> Schedule for {dayName}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {dayClasses.map(sch => (
                          <Card key={sch.id} className="group relative overflow-hidden rounded-2xl border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900">
                            {/* Decorative Top Accent */}
                            <div className={`h-1.5 w-full ${sch.isOnline ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />
                            
                            <CardContent className="p-5 pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                  <Badge variant="outline" className={`font-semibold tracking-wide text-[10px] uppercase ${sch.isOnline ? 'border-emerald-200 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-blue-200 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'}`}>
                                    {sch.classType}
                                  </Badge>
                                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight line-clamp-1" title={sch.courseTitle}>
                                    {sch.courseCode}
                                  </h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30" onClick={() => openEditDialog(sch)}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => handleDelete(sch.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-3 mt-5">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">{sch.startTime} <span className="text-slate-400 font-normal mx-1">to</span> {sch.endTime}</span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                  <div className="w-6 flex justify-center"><User className="h-4 w-4 text-slate-400" /></div>
                                  <span className="truncate">{sch.instructorName || 'TBA'}</span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                  <div className="w-6 flex justify-center">
                                    {sch.isOnline ? <MonitorPlay className="h-4 w-4 text-emerald-500" /> : <MapPin className="h-4 w-4 text-slate-400" />}
                                  </div>
                                  <span className="truncate font-medium">{sch.isOnline ? 'Online Meeting' : (sch.room || 'Room TBA')}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <DialogTitle className="text-2xl font-bold">{editingSchedule ? 'Edit Schedule' : 'Create New Class'}</DialogTitle>
            <DialogDescription className="text-blue-100 mt-2 text-base">
              Set the course, instructor, time, and location. Our system will automatically validate for any conflicts.
            </DialogDescription>
          </div>
          <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-950">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course <span className="text-red-500">*</span></Label>
                  <Select value={formData.courseId} onValueChange={v => setFormData(p => ({ ...p, courseId: v }))} required>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instructor</Label>
                  <Select value={formData.instructorId} onValueChange={v => setFormData(p => ({ ...p, instructorId: v }))}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select instructor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">TBA</SelectItem>
                      {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Day <span className="text-red-500">*</span></Label>
                  <Select value={formData.dayOfWeek} onValueChange={v => setFormData(p => ({ ...p, dayOfWeek: v }))} required>
                    <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Time <span className="text-red-500">*</span></Label>
                  <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="h-11 rounded-xl bg-white dark:bg-slate-950" required />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Time <span className="text-red-500">*</span></Label>
                  <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="h-11 rounded-xl bg-white dark:bg-slate-950" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Class Type</Label>
                  <Select value={formData.classType} onValueChange={v => setFormData(p => ({ ...p, classType: v }))}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mode</Label>
                  <Select value={formData.isOnline ? "online" : "offline"} onValueChange={v => setFormData(p => ({ ...p, isOnline: v === "online" }))}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">In-Person (Campus)</SelectItem>
                      <SelectItem value="online">Online / Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formData.isOnline ? 'Meeting Link' : 'Room / Venue'}</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {formData.isOnline ? <Laptop className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  </div>
                  <Input 
                    name={formData.isOnline ? "meetingUrl" : "room"} 
                    value={formData.isOnline ? formData.meetingUrl : formData.room} 
                    onChange={handleInputChange} 
                    placeholder={formData.isOnline ? "https://zoom.us/j/..." : "e.g. Block B, Room 204"} 
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
              <Button type="submit" disabled={submitting} className="rounded-xl h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? 'Checking conflicts...' : 'Save Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
