import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Plus, Edit2, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Label } from '@/components/ui/label';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminSemesters() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/semesters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch semesters');
      const data = await res.json();
      setSemesters(data);
    } catch (e) {
      toast.error('Failed to load semesters.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (semester = null) => {
    if (semester) {
      setEditingSemester(semester);
      setFormData({
        name: semester.name,
        code: semester.code,
        academicYear: semester.academicYear || '',
        startDate: semester.startDate,
        endDate: semester.endDate,
        status: semester.status
      });
    } else {
      setEditingSemester(null);
      setFormData({
        name: '',
        code: '',
        academicYear: '2024-2025',
        startDate: '',
        endDate: '',
        status: 'upcoming'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSemester 
        ? `${API_URL}/admin/semesters/${editingSemester.id}`
        : `${API_URL}/admin/semesters`;
      
      const method = editingSemester ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save semester');
      }

      toast.success(`Semester ${editingSemester ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
      fetchSemesters();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><PlayCircle className="w-3 h-3"/> Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><Clock className="w-3 h-3"/> Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${mobileOpen ? 'overflow-hidden h-screen' : ''}`}>
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <AdminHeader pageTitle="Semesters" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Academic Term Management
              </h1>
              <p className="text-slate-500">Manage academic years, semesters, and term schedules.</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" /> Add Semester
            </Button>
          </div>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader className="bg-slate-50 dark:bg-slate-800">
                     <TableRow>
                       <TableHead>Semester Name</TableHead>
                       <TableHead>Code</TableHead>
                       <TableHead>Academic Year</TableHead>
                       <TableHead>Duration</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {loading ? (
                       <TableRow>
                         <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading semesters...</TableCell>
                       </TableRow>
                     ) : semesters.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={6} className="text-center py-8 text-slate-500">No semesters found. Create one to get started.</TableCell>
                       </TableRow>
                     ) : (
                       semesters.map((term) => (
                         <TableRow key={term.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                           <TableCell className="font-medium">{term.name}</TableCell>
                           <TableCell>
                             <Badge variant="secondary" className="font-mono">{term.code}</Badge>
                           </TableCell>
                           <TableCell className="text-slate-500">{term.academicYear || '-'}</TableCell>
                           <TableCell className="text-sm text-slate-500">
                              {format(parseISO(term.startDate), 'MMM d, yyyy')} - {format(parseISO(term.endDate), 'MMM d, yyyy')}
                           </TableCell>
                           <TableCell>
                             {getStatusBadge(term.status)}
                           </TableCell>
                           <TableCell className="text-right">
                             <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(term)}>
                               <Edit2 className="w-4 h-4 text-slate-500" />
                             </Button>
                           </TableCell>
                         </TableRow>
                       ))
                     )}
                   </TableBody>
                 </Table>
               </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSemester ? 'Edit Semester' : 'Create Semester'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Semester Name</Label>
                <Input id="name" required placeholder="e.g. Fall 2024" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" required placeholder="e.g. FA24" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input id="academicYear" placeholder="e.g. 2024-2025" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
