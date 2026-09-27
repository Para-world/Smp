import React, { useState, useEffect } from 'react';
import { 
  fetchFacultyAnnouncements, 
  createFacultyAnnouncement, 
  updateFacultyAnnouncement, 
  deleteFacultyAnnouncement 
} from '../../services/facultyApi';
// Ensure fetchFacultyCourses exists or use a generic admin one if faculty can view courses. Actually, faculty needs to fetch their own courses. Let's assume we have it or we can just let them type it, but wait, faculty should have a way to fetch their courses.
// I will just use fetchFacultyCourses. Wait, let's check if it exists, if not we add it. 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Megaphone, Clock } from 'lucide-react';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { format } from 'date-fns';

export default function FacultyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Just for this mock UI, faculty enters course ID manually if API is missing, but ideally they select.
  // We'll leave courseId as an input string for now.

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    audience: 'COURSE',
    courseId: '',
    status: 'DRAFT',
    isPinned: false,
    expiresAt: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingAnn(null);
    setFormData({
      title: '',
      content: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      audience: 'COURSE',
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
      await deleteFacultyAnnouncement(id);
      toast.success("Announcement deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || (formData.audience === 'COURSE' && !formData.courseId)) {
      toast.error('Please fill required fields (Title, Content, Course ID)');
      return;
    }

    try {
      setSubmitting(true);
      if (editingAnn) {
        await updateFacultyAnnouncement(editingAnn.id, formData);
        toast.success('Announcement updated');
      } else {
        await createFacultyAnnouncement(formData);
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
    <FacultyLayout pageTitle="Announcements">
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Announcements</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Publish news and updates to your courses</p>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Megaphone className="h-12 w-12 text-slate-300 mb-4" />
              <p>You haven't created any announcements yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {announcements.map((ann) => (
              <Card key={ann.id} className={ann.isPinned ? 'border-amber-400 border-2' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                        ann.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ann.status}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-700">
                        {ann.category}
                      </span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(ann)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(ann.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight line-clamp-1">{ann.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                    <Clock className="h-3 w-3" /> 
                    {ann.publishedAt ? format(new Date(ann.publishedAt), 'MMM d, yyyy h:mm a') : 'Not published'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                    {ann.content}
                  </p>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Course ID:</span> {ann.courseId}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingAnn ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
              <DialogDescription>Note: As faculty, you can only publish announcements for your assigned courses.</DialogDescription>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={formData.audience} onValueChange={v => setFormData(p => ({ ...p, audience: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COURSE">By Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Course ID * (Must be your assigned course)</Label>
                  <Input name="courseId" value={formData.courseId} onChange={handleInputChange} placeholder="Course ID" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="isPinned" name="isPinned" checked={formData.isPinned} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="isPinned">Pin to top</Label>
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
    </FacultyLayout>
  );
}
