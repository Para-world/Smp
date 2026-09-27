import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminExams } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Plus, Search, Calendar, MapPin, Clock, FileText, LayoutList, CalendarDays, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminExams() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminExams();
      setExams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'SCHEDULED': return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case 'ONGOING': return <Badge className="bg-green-100 text-green-700">Ongoing</Badge>;
      case 'COMPLETED': return <Badge className="bg-slate-100 text-slate-700">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
      case 'POSTPONED': return <Badge className="bg-amber-100 text-amber-700">Postponed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedExams = filteredExams.reduce((acc, exam) => {
    const dateStr = exam.date ? format(new Date(exam.date), 'yyyy-MM-dd') : 'TBD';
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(exam);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedExams).sort();

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
          pageTitle="Exam Schedule"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                Exam Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                Organize, schedule, and oversee institutional examinations.
              </p>
            </div>
            <Link to="/admin/exams/create">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all rounded-xl px-6 h-11">
                <Plus className="h-5 w-5" /> Schedule Exam
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-2 sm:p-6">
            <Tabs defaultValue="list" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="h-12 inline-flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                  <TabsTrigger value="list" className="rounded-lg px-6 font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                    <LayoutList className="h-4 w-4" /> List View
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="rounded-lg px-6 font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Schedule View
                  </TabsTrigger>
                </TabsList>
                
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search exams or courses..."
                    className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="list" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                {loading ? (
                  <div className="flex justify-center items-center py-20 min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                      <p className="text-slate-500 font-medium">Loading exams...</p>
                    </div>
                  </div>
                ) : filteredExams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                      <FileText className="h-10 w-10 text-blue-300 dark:text-blue-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Exams Found</h3>
                    <p className="text-slate-500 dark:text-slate-500 max-w-sm mb-6">There are no exams matching your current search or no exams have been scheduled yet.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow className="hover:bg-transparent border-b-slate-200 dark:border-slate-800">
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Course</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Exam Title</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Date & Time</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Venue</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300 h-12">Status</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 h-12">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExams.map((exam) => (
                          <TableRow key={exam.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b-slate-100 dark:border-slate-800 transition-colors cursor-pointer group">
                            <TableCell className="py-4">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{exam.courseCode}</div>
                              <div className="text-xs text-slate-500 max-w-[200px] truncate" title={exam.courseTitle}>{exam.courseTitle}</div>
                            </TableCell>
                            <TableCell className="py-4 font-medium text-slate-800 dark:text-slate-200">{exam.title}</TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <Calendar className="mr-2 h-3.5 w-3.5 text-blue-500" />
                                {exam.date ? format(new Date(exam.date), 'MMM d, yyyy') : 'TBD'}
                              </div>
                              <div className="flex items-center text-xs text-slate-500">
                                <Clock className="mr-2 h-3.5 w-3.5 text-slate-400" />
                                {exam.startTime} - {exam.endTime}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-md inline-flex">
                                <MapPin className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                {exam.venue || 'TBD'}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">{getStatusBadge(exam.status)}</TableCell>
                            <TableCell className="py-4 text-right">
                              <Link to={`/admin/exams/${exam.id}/edit`}>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                  Manage
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                {loading ? (
                  <div className="flex justify-center items-center py-20 min-h-[300px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                  </div>
                ) : sortedDates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                      <CalendarDays className="h-10 w-10 text-blue-300 dark:text-blue-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Exams Found</h3>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {sortedDates.map(dateStr => (
                      <div key={dateStr} className="relative">
                        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-3 px-5 rounded-xl font-bold text-slate-800 dark:text-slate-200 mb-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg mr-3">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          {dateStr === 'TBD' ? 'To Be Determined' : format(new Date(dateStr), 'EEEE, MMMM do, yyyy')}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pl-2">
                          {groupedExams[dateStr].sort((a,b) => a.startTime?.localeCompare(b.startTime)).map(exam => (
                            <Card key={exam.id} className="group relative overflow-hidden rounded-2xl border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900">
                              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                              
                              <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                  <Badge variant="outline" className="font-semibold tracking-wide text-[10px] uppercase border-blue-200 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                                    {exam.courseCode}
                                  </Badge>
                                  {getStatusBadge(exam.status)}
                                </div>
                                
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight line-clamp-1 mb-1" title={exam.title}>{exam.title}</h3>
                                <p className="text-xs text-slate-500 mb-5 line-clamp-1">{exam.courseTitle}</p>
                                
                                <div className="space-y-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                                    <Clock className="mr-3 h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{exam.startTime} - {exam.endTime}</span>
                                    <span className="ml-2 text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{exam.durationMinutes}m</span>
                                  </div>
                                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                                    <MapPin className="mr-3 h-4 w-4 text-amber-500" />
                                    <span className="truncate font-medium">{exam.venue || 'No Venue Assigned'}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                  <Link to={`/admin/exams/${exam.id}/edit`} className="w-full">
                                    <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                      Manage Details
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
