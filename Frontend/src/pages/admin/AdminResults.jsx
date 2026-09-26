import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminResults, updateAdminResultStatus } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Plus, Search, CheckCircle, XCircle, FileEdit, GraduationCap, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';

export default function AdminResults({ mobileOpen, setMobileOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminResults();
      setResults(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAdminResultStatus(id, newStatus);
      toast.success(`Result marked as ${newStatus}`);
      loadResults();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
      case 'PENDING_REVIEW': return <Badge className="bg-blue-100 text-blue-700">Review</Badge>;
      case 'PUBLISHED': return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case 'WITHHELD': return <Badge className="bg-red-100 text-red-700">Withheld</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredResults = results.filter(res => 
    res.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          pageTitle="Result Management"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Results</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and publish student academic records</p>
            </div>
            <Link to="/admin/results/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Enter Marks
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b gap-4">
              <CardTitle className="text-xl">Student Records</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search student or course..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-center">Total Marks</TableHead>
                        <TableHead className="text-center">Grade (GP)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No results found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div className="font-medium">{result.studentName}</div>
                              <div className="text-xs text-slate-500">{result.studentEmail}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{result.courseCode}</div>
                              <div className="text-xs text-slate-500 max-w-[200px] truncate" title={result.courseTitle}>
                                {result.courseTitle}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {result.totalMarks ?? '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {result.grade ? (
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {result.grade} <span className="text-xs font-normal text-slate-500">({result.gradePoint})</span>
                               </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(result.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                {result.status === 'DRAFT' && (
                                  <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => handleStatusChange(result.id, 'PENDING_REVIEW')}>
                                    Review
                                  </Button>
                                )}
                                {result.status === 'PENDING_REVIEW' && (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2" onClick={() => handleStatusChange(result.id, 'PUBLISHED')}>
                                    Publish
                                  </Button>
                                )}
                                {result.status === 'PUBLISHED' && (
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 text-xs h-7 px-2" onClick={() => handleStatusChange(result.id, 'WITHHELD')}>
                                    Withhold
                                  </Button>
                                )}
                                <Link to={`/admin/results/${result.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500">
                                    <FileEdit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
