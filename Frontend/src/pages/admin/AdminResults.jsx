import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminResults, updateAdminResultStatus, fetchResultAuditLogs } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Plus, Search, CheckCircle, XCircle, FileEdit, GraduationCap, ArrowRight, History, FileSpreadsheet, Medal, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';

export default function AdminResults({ mobileOpen, setMobileOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

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

  const handleViewAudit = async (result) => {
    setSelectedResult(result);
    setAuditDialogOpen(true);
    try {
      setLoadingLogs(true);
      const logs = await fetchResultAuditLogs(result.id);
      setAuditLogs(logs);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleStatusChange = async (id, newStatus, currentStatus) => {
    let reason = '';
    if (currentStatus === 'PUBLISHED') {
      reason = window.prompt('Please provide a reason for changing a published result:');
      if (reason === null) return; // User cancelled
    }
    
    try {
      await updateAdminResultStatus(id, newStatus, reason);
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

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Medal className="h-6 w-6" />
                </div>
                Academic Results
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                Manage, audit, and publish student academic performance records.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link to="/admin/results/import" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full gap-2 rounded-xl h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <FileSpreadsheet className="h-4 w-4" /> Bulk Import
                </Button>
              </Link>
              <Link to="/admin/results/create" className="flex-1 sm:flex-none">
                <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all rounded-xl h-11">
                  <Plus className="h-4 w-4" /> Enter Marks
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Student Records</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search student or course..."
                  className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-0 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-20 min-h-[300px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
                    <p className="text-slate-500 font-medium">Loading records...</p>
                  </div>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 m-6">
                  <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                    <GraduationCap className="h-10 w-10 text-indigo-300 dark:text-indigo-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Results Found</h3>
                  <p className="text-slate-500 dark:text-slate-500 max-w-sm mb-6">There are no academic results matching your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow className="hover:bg-transparent border-b-slate-200 dark:border-slate-800">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Student</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Course</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12 text-center">Total Marks</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12 text-center">Grade (GP)</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 h-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result) => (
                        <TableRow key={result.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b-slate-100 dark:border-slate-800 transition-colors group">
                          <TableCell className="py-4">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{result.studentName}</div>
                            <div className="text-xs text-slate-500">{result.studentEmail}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{result.courseCode}</div>
                            <div className="text-xs text-slate-500 max-w-[180px] truncate" title={result.courseTitle}>{result.courseTitle}</div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {result.totalMarks ?? '-'} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            {result.grade ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`font-bold text-lg ${result.grade === 'F' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {result.grade}
                                  </span>
                                  <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                    {result.gradePoint}
                                  </Badge>
                                </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="py-4">{getStatusBadge(result.status)}</TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {result.status === 'DRAFT' && (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(result.id, 'PENDING_REVIEW', result.status)} className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 px-2">
                                  Review
                                </Button>
                              )}
                              {result.status === 'PENDING_REVIEW' && (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(result.id, 'PUBLISHED', result.status)} className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30 px-2">
                                  Publish
                                </Button>
                              )}
                              {result.status === 'PUBLISHED' && (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(result.id, 'WITHHELD', result.status)} className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 px-2">
                                  Withhold
                                </Button>
                              )}
                              <Link to={`/admin/results/${result.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => handleViewAudit(result)} className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                                <History className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Audit History</DialogTitle>
              <DialogDescription className="text-slate-300 mt-1">
                {selectedResult?.studentName} - {selectedResult?.courseCode}
              </DialogDescription>
            </div>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50 dark:bg-slate-950">
            {loadingLogs ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400">No modifications recorded for this result.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Timeline dot */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <History className="h-3.5 w-3.5" />
                    </div>
                    {/* Content */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {log.changedBy || 'System'}
                        </div>
                        <time className="text-xs font-medium text-slate-500">
                          {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                        </time>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Modified <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.changeType.replace(/_/g, ' ')}</span>
                      </div>
                      
                      <div className="mt-2 flex flex-col gap-2 text-xs font-mono">
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500 block mb-1">Previous</span>
                           <pre className="whitespace-pre-wrap text-red-500 line-through">{log.oldValue ? JSON.stringify(log.oldValue, null, 2) : 'None'}</pre>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500 block mb-1">New</span>
                           <pre className="whitespace-pre-wrap text-emerald-600 dark:text-emerald-400">{log.newValue ? JSON.stringify(log.newValue, null, 2) : 'None'}</pre>
                        </div>
                      </div>
                      {log.reason && (
                        <div className="mt-3 text-xs italic text-slate-500 border-l-2 border-amber-400 pl-2">
                          "{log.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
            <Button onClick={() => setAuditDialogOpen(false)} variant="outline" className="rounded-xl px-6">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
