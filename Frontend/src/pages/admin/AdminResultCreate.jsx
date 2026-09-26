import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAdminCourses, fetchAdminStudents, fetchAdminResults, updateAdminResultStatus } from '../../services/adminApi';
import { createAdminResult } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminResultCreate({ mobileOpen, setMobileOpen }) {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Hardcoded for demo, normally fetched from a semester API
  const semesters = [
    { id: 'sem-fall-2026', name: 'Fall 2026' },
    { id: 'sem-spring-2027', name: 'Spring 2027' }
  ];

  const [formData, setFormData] = useState({
    courseId: '',
    semesterId: '',
    academicYear: '2026-2027',
    studentId: '',
    internalMarks: '',
    externalMarks: '',
    practicalMarks: '',
    totalMarks: '',
    grade: '',
    gradePoint: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    loadDropdownData();
    if (isEditing) {
      loadExistingResult();
    }
  }, [id]);

  const loadExistingResult = async () => {
    try {
      // In a real app we would have a fetchAdminResult(id) API. 
      // Since we don't, we can fetch all and filter or add an endpoint.
      // Let's just fetch all and find it for simplicity.
      const data = await fetchAdminResults();
      const existing = data.find(r => r.id === id);
      if (existing) {
        setFormData({
          courseId: existing.courseId,
          semesterId: existing.semesterId,
          academicYear: existing.academicYear || '2026-2027',
          studentId: existing.studentId,
          internalMarks: existing.internalMarks ?? '',
          externalMarks: existing.externalMarks ?? '',
          practicalMarks: existing.practicalMarks ?? '',
          totalMarks: existing.totalMarks ?? '',
          grade: existing.grade ?? '',
          gradePoint: existing.gradePoint ?? '',
          status: existing.status,
        });
      }
    } catch (error) {
      toast.error('Failed to load existing result');
    }
  };

  const loadDropdownData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        fetchAdminCourses({ limit: 100 }),
        fetchAdminStudents({ limit: 100 })
      ]);
      setCourses(coursesRes.data || []);
      setStudents(studentsRes.data || []);
      // If we had a semesters API we'd fetch it here.
    } catch (error) {
      toast.error('Failed to load selection data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate Total Marks if all parts are available (very basic example)
      if (['internalMarks', 'externalMarks', 'practicalMarks'].includes(name)) {
        const i = parseInt(updated.internalMarks || 0, 10);
        const eVal = parseInt(updated.externalMarks || 0, 10);
        const p = parseInt(updated.practicalMarks || 0, 10);
        
        if (updated.internalMarks !== '' || updated.externalMarks !== '' || updated.practicalMarks !== '') {
           updated.totalMarks = (i + eVal + p).toString();
        }
      }
      return updated;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.courseId || !formData.semesterId) {
      toast.error('Student, Course, and Semester are strictly required.');
      return;
    }

    try {
      setSubmitting(true);
      // For semester ID, normally it should be a UUID. We mock it if it's the hardcoded dummy.
      // But let's assume the backend will handle or we just pass the dummy for now.
      // Wait, db requires a UUID. The user might not have `semesters` populated in DB.
      // For this robust prototype, we might want to just proceed and hope the DB constraints are relaxed, 
      // OR we just use a valid string if the schema allows it. 
      // Actually schema requires semesterId to be a UUID referencing semesters table.
      // If the backend fails foreign key constraint, we will see an error.
      
      await createAdminResult(formData);
      toast.success('Marks saved successfully');
      navigate('/admin/results');
    } catch (error) {
      toast.error(error.message || 'Failed to save marks. Check database relations.');
    } finally {
      setSubmitting(false);
    }
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
          pageTitle="Enter Marks"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/admin/results">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{isEditing ? 'Edit Marks' : 'Record Marks'}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Enter student assessment components</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                
                {/* Context Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Context</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Course <span className="text-red-500">*</span></Label>
                        <Select value={formData.courseId} onValueChange={(val) => handleSelectChange('courseId', val)} required disabled={isEditing}>
                          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                          <SelectContent>
                            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Student <span className="text-red-500">*</span></Label>
                        <Select value={formData.studentId} onValueChange={(val) => handleSelectChange('studentId', val)} required disabled={isEditing}>
                          <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                          <SelectContent>
                            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Semester <span className="text-red-500">*</span></Label>
                        {/* We use an input here to just type UUID if needed, but for better UI a select. Since semesters might be empty, I'll allow typing or selecting */}
                        <Input 
                          placeholder="Semester UUID" 
                          value={formData.semesterId} 
                          onChange={(e) => handleSelectChange('semesterId', e.target.value)} 
                          required 
                        />
                        <p className="text-xs text-slate-500">Provide a valid Semester UUID from database.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Input
                          name="academicYear"
                          placeholder="e.g. 2026-2027"
                          value={formData.academicYear}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Marks Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Marks & Grading</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Internal Marks</Label>
                        <Input type="number" name="internalMarks" value={formData.internalMarks} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>External Marks</Label>
                        <Input type="number" name="externalMarks" value={formData.externalMarks} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Practical Marks</Label>
                        <Input type="number" name="practicalMarks" value={formData.practicalMarks} onChange={handleInputChange} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Total Marks</Label>
                        <Input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Calculated Grade</Label>
                        <Input name="grade" placeholder="A+" value={formData.grade} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Grade Point</Label>
                        <Input type="number" name="gradePoint" placeholder="9" value={formData.gradePoint} onChange={handleInputChange} />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t mt-4">
                      <div className="space-y-2 md:w-1/3">
                        <Label>Initial Status</Label>
                        <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/results')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                    {submitting ? 'Saving...' : 'Save Result Record'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
