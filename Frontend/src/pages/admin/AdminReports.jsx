import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { FileText, Download, BarChart2, Users, CheckCircle, Award } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { fetchAdminReports, fetchAdminSemesters, fetchAdminCourses } from '../../services/adminApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

export default function AdminReports() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  
  // Lookups
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    program: '',
    department: '',
    semester: '',
    academicYear: '',
    course: '',
    startDate: '',
    endDate: ''
  });

  // Report Data States
  const [studentData, setStudentData] = useState({ activeInactive: null, bySemester: null, byProgram: null });
  const [attendanceData, setAttendanceData] = useState({ overall: null, course: null, low: null });
  const [academicData, setAcademicData] = useState({ passFail: null, gradeDist: null, coursePerf: null });
  const [assignmentData, setAssignmentData] = useState({ submissionRate: null, late: null, grading: null });

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    generateReport(activeTab);
  }, [activeTab, filters]);

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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value === 'all' ? '' : value }));
  };

  const generateReport = async (category) => {
    setLoading(true);
    try {
      if (category === 'students') {
        const [active, bySem, byProg] = await Promise.all([
          fetchAdminReports({ category: 'students', type: 'active_inactive', ...filters }),
          fetchAdminReports({ category: 'students', type: 'by_semester', ...filters }),
          fetchAdminReports({ category: 'students', type: 'by_program', ...filters })
        ]);
        setStudentData({ activeInactive: active, bySemester: bySem, byProgram: byProg });
      } 
      else if (category === 'attendance') {
        const [overall, crs, low] = await Promise.all([
          fetchAdminReports({ category: 'attendance', type: 'overall', ...filters }),
          fetchAdminReports({ category: 'attendance', type: 'course', ...filters }),
          fetchAdminReports({ category: 'attendance', type: 'low_attendance', ...filters })
        ]);
        setAttendanceData({ overall, course: crs, low });
      }
      else if (category === 'academic') {
        const [pf, grade, perf] = await Promise.all([
          fetchAdminReports({ category: 'academic', type: 'pass_fail', ...filters }),
          fetchAdminReports({ category: 'academic', type: 'grade_distribution', ...filters }),
          fetchAdminReports({ category: 'academic', type: 'course_performance', ...filters })
        ]);
        setAcademicData({ passFail: pf, gradeDist: grade, coursePerf: perf });
      }
      else if (category === 'assignments') {
        const [rate, late, grad] = await Promise.all([
          fetchAdminReports({ category: 'assignment', type: 'submission_rate', ...filters }),
          fetchAdminReports({ category: 'assignment', type: 'late_submissions', ...filters }),
          fetchAdminReports({ category: 'assignment', type: 'grading_completion', ...filters })
        ]);
        setAssignmentData({ submissionRate: rate, late, grading: grad });
      }
    } catch (error) {
      toast.error('Failed to generate report for ' + category);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    // Simple mock export functionality
    toast.success('Report export started. Check your downloads.');
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${mobileOpen ? 'overflow-hidden h-screen' : ''}`}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <AdminHeader
          pageTitle="Reports & Analytics"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Institution Analytics</h1>
              <p className="text-slate-500">Comprehensive insights into academic and operational performance.</p>
            </div>
            <Button onClick={exportCSV} variant="outline" className="shrink-0 gap-2">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" /> Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Program</label>
                  <Input 
                    placeholder="e.g. BCA" 
                    value={filters.program} 
                    onChange={e => handleFilterChange('program', e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Semester</label>
                  <Select value={filters.semester || 'all'} onValueChange={v => handleFilterChange('semester', v)}>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Course</label>
                  <Select value={filters.course || 'all'} onValueChange={v => handleFilterChange('course', v)}>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Academic Year</label>
                  <Input 
                    placeholder="e.g. 2026-2027" 
                    value={filters.academicYear} 
                    onChange={e => handleFilterChange('academicYear', e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 w-full flex overflow-x-auto justify-start h-auto">
              <TabsTrigger value="students" className="gap-2 px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md shadow-sm">
                <Users className="w-4 h-4" /> Students
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2 px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md shadow-sm">
                <CheckCircle className="w-4 h-4" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="academic" className="gap-2 px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md shadow-sm">
                <Award className="w-4 h-4" /> Academic
              </TabsTrigger>
              <TabsTrigger value="assignments" className="gap-2 px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md shadow-sm">
                <FileText className="w-4 h-4" /> Assignments
              </TabsTrigger>
            </TabsList>

            {loading ? (
               <div className="flex justify-center p-24">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
               </div>
            ) : (
              <>
                {/* STUDENTS REPORT */}
                <TabsContent value="students" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Students by Program</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {studentData.byProgram?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentData.byProgram} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="program" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p className="text-slate-500 text-center pt-24">No data available</p>}
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Active vs Inactive</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {studentData.activeInactive && studentData.activeInactive.total > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie 
                                data={[
                                  { name: 'Active', value: studentData.activeInactive.active },
                                  { name: 'Inactive', value: studentData.activeInactive.inactive }
                                ]} 
                                cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <p className="text-slate-500 text-center pt-24">No data available</p>}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* ACADEMIC REPORT */}
                <TabsContent value="academic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Grade Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {academicData.gradeDist?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={academicData.gradeDist} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="grade" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p className="text-slate-500 text-center pt-24">No grading data available</p>}
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Course Pass Rates (%)</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {academicData.coursePerf?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={academicData.coursePerf} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis dataKey="courseId" type="category" width={100} hide />
                              <RechartsTooltip />
                              <Bar dataKey="passRate" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p className="text-slate-500 text-center pt-24">No course performance data</p>}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* ATTENDANCE & ASSIGNMENTS */}
                <TabsContent value="attendance" className="space-y-6">
                   <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Overall Attendance Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {attendanceData.overall && attendanceData.overall.total > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie 
                                data={[
                                  { name: 'Present', value: attendanceData.overall.present },
                                  { name: 'Absent', value: attendanceData.overall.absent },
                                  { name: 'Late', value: attendanceData.overall.late }
                                ]} 
                                cx="50%" cy="50%" outerRadius={100} dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                                <Cell fill="#f59e0b" />
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <p className="text-slate-500 text-center pt-24">No attendance data recorded</p>}
                      </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-6">
                   <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Assignment Submission Tracking</CardTitle>
                        <CardDescription>Submission rate by assignment</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {assignmentData.submissionRate?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assignmentData.submissionRate} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="assignment" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="submissions" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p className="text-slate-500 text-center pt-24">No assignments data found</p>}
                      </CardContent>
                    </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
