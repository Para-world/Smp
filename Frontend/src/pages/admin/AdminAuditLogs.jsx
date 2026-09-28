import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminAuditLogs() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    action: 'all',
    entity: 'all'
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page,
        limit: 20
      });
      if (search) queryParams.append('search', search);
      if (filters.action !== 'all') queryParams.append('action', filters.action);
      if (filters.entity !== 'all') queryParams.append('entity', filters.entity);

      const res = await fetch(`${API_URL}/admin/audit-logs?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data.data);
      setTotalPages(data.meta.totalPages || 1);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const formatValue = (val) => {
    if (!val) return '-';
    if (typeof val === 'object') return JSON.stringify(val).substring(0, 50) + (JSON.stringify(val).length > 50 ? '...' : '');
    return String(val);
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${mobileOpen ? 'overflow-hidden h-screen' : ''}`}>
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <AdminHeader pageTitle="System Audit Logs" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Audit Logs
              </h1>
              <p className="text-slate-500">Track and monitor important system actions and security events.</p>
            </div>
          </div>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4">
               <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search by action or entity..." 
                      className="pl-9"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={filters.action} onValueChange={v => { setFilters(f => ({ ...f, action: v })); setPage(1); }}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="CREATE">CREATE</SelectItem>
                      <SelectItem value="UPDATE">UPDATE</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PUBLISH">PUBLISH</SelectItem>
                      <SelectItem value="STATUS_CHANGE">STATUS_CHANGE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="secondary" className="gap-2">
                    <Filter className="w-4 h-4" /> Filter
                  </Button>
               </form>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader className="bg-slate-50 dark:bg-slate-800">
                     <TableRow>
                       <TableHead>Timestamp</TableHead>
                       <TableHead>Actor</TableHead>
                       <TableHead>Action</TableHead>
                       <TableHead>Entity</TableHead>
                       <TableHead>Changes</TableHead>
                       <TableHead>IP Address</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {loading ? (
                       <TableRow>
                         <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading audit logs...</TableCell>
                       </TableRow>
                     ) : logs.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={6} className="text-center py-8 text-slate-500">No audit logs found matching criteria.</TableCell>
                       </TableRow>
                     ) : (
                       logs.map((log) => (
                         <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                           <TableCell className="whitespace-nowrap text-sm text-slate-500">
                             {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                           </TableCell>
                           <TableCell>
                             <div className="font-medium">{log.actorName}</div>
                             <div className="text-xs text-slate-500">{log.actorEmail}</div>
                           </TableCell>
                           <TableCell>
                             <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                               {log.action}
                             </Badge>
                           </TableCell>
                           <TableCell>
                             <div className="font-medium capitalize">{log.entity}</div>
                             <div className="text-xs text-slate-500 font-mono" title={log.entityId}>{log.entityId?.substring(0, 8)}...</div>
                           </TableCell>
                           <TableCell className="max-w-[200px]">
                              <div className="text-xs">
                                <span className="text-red-500 line-through mr-1">{formatValue(log.oldValue)}</span>
                                <span className="text-emerald-600">{formatValue(log.newValue)}</span>
                              </div>
                           </TableCell>
                           <TableCell className="text-xs text-slate-500 font-mono">
                             {log.ipAddress || 'System'}
                           </TableCell>
                         </TableRow>
                       ))
                     )}
                   </TableBody>
                 </Table>
               </div>
               
               {/* Pagination */}
               {!loading && logs.length > 0 && (
                 <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                       <ChevronLeft className="w-4 h-4" /> Previous
                     </Button>
                     <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                       Next <ChevronRight className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
