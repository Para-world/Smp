import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Edit2, Network, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminDepartments() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Department Dialog state
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });

  // Program Dialog state
  const [progDialogOpen, setProgDialogOpen] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [progForm, setProgForm] = useState({ name: '', code: '', description: '', departmentId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [deptRes, progRes] = await Promise.all([
        fetch(`${API_URL}/admin/departments`, { headers }),
        fetch(`${API_URL}/admin/programs`, { headers })
      ]);

      if (!deptRes.ok || !progRes.ok) throw new Error('Failed to fetch organization data');

      setDepartments(await deptRes.json());
      setPrograms(await progRes.json());
    } catch (e) {
      toast.error('Failed to load organization structure.');
    } finally {
      setLoading(false);
    }
  };

  // --- Department Handlers ---
  const handleOpenDeptDialog = (dept = null) => {
    setEditingDept(dept);
    setDeptForm(dept ? { name: dept.name, code: dept.code, description: dept.description || '' } : { name: '', code: '', description: '' });
    setDeptDialogOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDept ? `${API_URL}/admin/departments/${editingDept.id}` : `${API_URL}/admin/departments`;
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(deptForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save department');
      }

      toast.success(`Department ${editingDept ? 'updated' : 'created'}`);
      setDeptDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // --- Program Handlers ---
  const handleOpenProgDialog = (prog = null) => {
    setEditingProg(prog);
    setProgForm(prog 
      ? { name: prog.name, code: prog.code, description: prog.description || '', departmentId: prog.departmentId } 
      : { name: '', code: '', description: '', departmentId: departments[0]?.id || '' }
    );
    setProgDialogOpen(true);
  };

  const handleProgSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!progForm.departmentId) {
        toast.error("Please select a department.");
        return;
      }
      const token = localStorage.getItem('token');
      const url = editingProg ? `${API_URL}/admin/programs/${editingProg.id}` : `${API_URL}/admin/programs`;
      const method = editingProg ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(progForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save program');
      }

      toast.success(`Program ${editingProg ? 'updated' : 'created'}`);
      setProgDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getDeptName = (deptId) => {
    const d = departments.find(d => d.id === deptId);
    return d ? d.name : 'Unknown';
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${mobileOpen ? 'overflow-hidden h-screen' : ''}`}>
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <AdminHeader pageTitle="Organization" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                Departments & Programs
              </h1>
              <p className="text-slate-500">Manage institutional structure and degree programs.</p>
            </div>
          </div>

          <Tabs defaultValue="departments" className="w-full">
            <TabsList className="grid w-[400px] grid-cols-2 h-12 bg-slate-100 dark:bg-slate-800/50">
              <TabsTrigger value="departments" className="gap-2"><Network className="w-4 h-4" /> Departments</TabsTrigger>
              <TabsTrigger value="programs" className="gap-2"><GraduationCap className="w-4 h-4" /> Programs</TabsTrigger>
            </TabsList>
            
            {/* DEPARTMENTS TAB */}
            <TabsContent value="departments" className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenDeptDialog()} className="gap-2"><Plus className="w-4 h-4" /> Add Department</Button>
              </div>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800">
                        <TableRow>
                          <TableHead>Department Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : departments.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-8">No departments found.</TableCell></TableRow>
                        ) : (
                          departments.map(dept => (
                            <TableRow key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell className="font-medium">{dept.name}</TableCell>
                              <TableCell><Badge variant="outline" className="font-mono">{dept.code}</Badge></TableCell>
                              <TableCell className="text-slate-500 max-w-xs truncate">{dept.description || '-'}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDeptDialog(dept)}>
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
            </TabsContent>

            {/* PROGRAMS TAB */}
            <TabsContent value="programs" className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenProgDialog()} className="gap-2"><Plus className="w-4 h-4" /> Add Program</Button>
              </div>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800">
                        <TableRow>
                          <TableHead>Program Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : programs.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-8">No programs found.</TableCell></TableRow>
                        ) : (
                          programs.map(prog => (
                            <TableRow key={prog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell className="font-medium">{prog.name}</TableCell>
                              <TableCell><Badge variant="secondary" className="font-mono">{prog.code}</Badge></TableCell>
                              <TableCell className="text-slate-500">{getDeptName(prog.departmentId)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenProgDialog(prog)}>
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
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Department Dialog */}
      <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleDeptSubmit}>
            <DialogHeader>
              <DialogTitle>{editingDept ? 'Edit Department' : 'Create Department'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dept_name">Department Name</Label>
                <Input id="dept_name" required placeholder="e.g. Computer Science" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dept_code">Code</Label>
                <Input id="dept_code" required placeholder="e.g. CS" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dept_desc">Description</Label>
                <Input id="dept_desc" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeptDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Program Dialog */}
      <Dialog open={progDialogOpen} onOpenChange={setProgDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleProgSubmit}>
            <DialogHeader>
              <DialogTitle>{editingProg ? 'Edit Program' : 'Create Program'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="prog_name">Program Name</Label>
                <Input id="prog_name" required placeholder="e.g. Bachelor of Computer Applications" value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prog_code">Code</Label>
                <Input id="prog_code" required placeholder="e.g. BCA" value={progForm.code} onChange={e => setProgForm({...progForm, code: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prog_dept">Department</Label>
                <Select value={progForm.departmentId} onValueChange={v => setProgForm({...progForm, departmentId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProgDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
