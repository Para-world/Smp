import React, { useState, useEffect } from 'react';
import { 
  fetchAdminAnnouncements, 
  createAdminAnnouncement, 
  updateAdminAnnouncement, 
  deleteAdminAnnouncement,
  fetchAdminCourses,
  fetchAdminSemesters
} from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Megaphone, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { format } from 'date-fns';

export default function AdminAnnouncements({ mobileOpen, setMobileOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    audience: 'ALL',
    program: '',
    semesterId: '',
    courseId: '',
    status: 'DRAFT',
    isPinned: false,
    expiresAt: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadDropdowns();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [coursesRes, semsRes] = await Promise.all([
        fetchAdminCourses({ limit: 100 }),
        fetchAdminSemesters()
      ]);
      setCourses(coursesRes.data || []);
      setSemesters(semsRes || []);
    } catch (error) {
      toast.error('Failed to load selection lists');
    }
  };

  const openAddDialog = () => {
    setEditingAnn(null);
    setFormData({
      title: '',
      content: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      audience: 'ALL',
      program: '',
      semesterId: '',
      courseId: '',
      status: 'DRAFT',
      isPinned: false,
      expiresAt: ''
    });
    setDialogOpen(true);
  };

  const openEditDialog = (ann) => {
    setEditingAnn(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      priority: ann.priority,
      audience: ann.audience,
      program: ann.program || '',
      semesterId: ann.semesterId || '',
      courseId: ann.courseId || '',
      status: ann.status,
      isPinned: ann.isPinned,
      expiresAt: ann.expiresAt ? new Date(ann.expiresAt).toISOString().slice(0, 16) : ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAdminAnnouncement(id);
      toast.success("Announcement deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingAnn) {
        await updateAdminAnnouncement(editingAnn.id, formData);
        toast.success('Announcement updated');
      } else {
        await createAdminAnnouncement(formData);
        toast.success('Announcement created');
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save announcement');
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
          pageTitle="Announcements Management"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system-wide and targeted announcements</p>
            </div>
            <Button onClick={openAddDialog} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Megaphone className="h-12 w-12 text-slate-300 mb-4" />
                <p>No announcements found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((ann) => (
                <Card key={ann.id} className={`flex flex-col h-full ${ann.isPinned ? 'border-amber-400 border-2' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                          ann.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          ann.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ann.status}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase bg-blue-100 text-blue-700">
                          {ann.category}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase bg-purple-100 text-purple-700">
                          {ann.audience}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => openEditDialog(ann)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-600" onClick={() => handleDelete(ann.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight line-clamp-2">{ann.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                      <Clock className="h-3 w-3" /> 
                      {ann.publishedAt ? format(new Date(ann.publishedAt), 'MMM d, yyyy h:mm a') : 'Not published'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                      {ann.content}
                    </p>
                    <div className="text-xs text-slate-500 flex flex-col gap-1">
                      <span><strong>Author:</strong> {ann.authorName}</span>
                      {ann.audience === 'COURSE' && <span><strong>Course:</strong> {ann.courseId}</span>}
                      {ann.audience === 'PROGRAM' && <span><strong>Program:</strong> {ann.program}</span>}
                      {ann.expiresAt && <span className="text-amber-600"><strong>Expires:</strong> {format(new Date(ann.expiresAt), 'MMM d, yyyy')}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingAnn ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
              <DialogDescription>Target announcements to specific audiences.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input name="title" value={formData.title} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea name="content" value={formData.content} onChange={handleInputChange} className="min-h-[120px]" required />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={formData.audience} onValueChange={v => setFormData(p => ({ ...p, audience: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Students</SelectItem>
                      <SelectItem value="PROGRAM">By Program</SelectItem>
                      <SelectItem value="SEMESTER">By Semester</SelectItem>
                      <SelectItem value="COURSE">By Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Audience Fields */}
              {formData.audience === 'PROGRAM' && (
                <div className="space-y-2">
                  <Label>Program Name</Label>
                  <Input name="program" value={formData.program} onChange={handleInputChange} placeholder="e.g. BCA" required />
                </div>
              )}
              {formData.audience === 'SEMESTER' && (
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={formData.semesterId} onValueChange={v => setFormData(p => ({ ...p, semesterId: v }))} required>
                    <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                    <SelectContent>
                      {semesters.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formData.audience === 'COURSE' && (
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={formData.courseId} onValueChange={v => setFormData(p => ({ ...p, courseId: v }))} required>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input type="checkbox" id="isPinned" name="isPinned" checked={formData.isPinned} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300" />
                  <Label htmlFor="isPinned">Pin to top</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Announcement'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
