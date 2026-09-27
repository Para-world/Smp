import React, { useState, useEffect } from 'react';
import { fetchAdminTimetable, createAdminTimetable, updateAdminTimetable, deleteAdminTimetable, fetchAdminCourses, fetchAdminInstructors } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Clock, MapPin, User, BookOpen, Trash2, Edit } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

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

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Timetable</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage weekly class schedules</p>
            </div>
            <Button onClick={openAddDialog} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Class
            </Button>
          </div>

          <div className="space-y-8">
            {schedulesByDay.map(({ dayIndex, dayName, classes }) => {
              if (classes.length === 0 && dayIndex === 0) return null; // Skip Sunday if empty
              
              return (
                <div key={dayIndex} className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2 text-slate-800 dark:text-slate-200">{dayName}</h2>
                  {classes.length === 0 ? (
                    <p className="text-slate-500 text-sm">No classes scheduled.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {classes.map(sch => (
                        <Card key={sch.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-2 w-full bg-blue-500" />
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg leading-tight truncate pr-2" title={sch.courseTitle}>
                                {sch.courseCode}
                              </h3>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-blue-600" onClick={() => openEditDialog(sch)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-red-600" onClick={() => handleDelete(sch.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>{sch.startTime} - {sch.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-emerald-500" />
                                <span className="truncate">{sch.instructorName || 'Unassigned'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-amber-500" />
                                <span className="truncate">{sch.isOnline ? 'Online' : (sch.room || 'TBA')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-purple-500" />
                                <span className="capitalize">{sch.classType}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
              <DialogDescription>
                Assign course, instructor, time and venue. Validation will check for conflicts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course *</Label>
                  <Select value={formData.courseId} onValueChange={v => setFormData(p => ({ ...p, courseId: v }))} required>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Select value={formData.instructorId} onValueChange={v => setFormData(p => ({ ...p, instructorId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select instructor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">TBA</SelectItem>
                      {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Day *</Label>
                  <Select value={formData.dayOfWeek} onValueChange={v => setFormData(p => ({ ...p, dayOfWeek: v }))} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room / Venue</Label>
                  <Input name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g. B-204" />
                </div>
                <div className="space-y-2">
                  <Label>Class Type</Label>
                  <Select value={formData.classType} onValueChange={v => setFormData(p => ({ ...p, classType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
