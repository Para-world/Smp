import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminExams } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Plus, Search, Calendar, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminExams() {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage institutional examination schedule</p>
        </div>
        <Link to="/admin/exams/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Schedule Exam
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b gap-4">
          <CardTitle className="text-xl">All Exams</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search exams or courses..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Schedule View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Exam Title</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No exams scheduled yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExams.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell>
                              <div className="font-medium">{exam.courseCode}</div>
                              <div className="text-xs text-slate-500 max-w-[200px] truncate">{exam.courseTitle}</div>
                            </TableCell>
                            <TableCell className="font-medium">{exam.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Calendar className="mr-1.5 h-3 w-3 text-slate-400" />
                                {exam.date ? format(new Date(exam.date), 'MMM d, yyyy') : 'TBD'}
                              </div>
                              <div className="flex items-center text-xs text-slate-500 mt-1">
                                <Clock className="mr-1.5 h-3 w-3 text-slate-400" />
                                {exam.startTime} - {exam.endTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-1.5 h-3 w-3 text-slate-400" />
                                {exam.venue || 'TBD'}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(exam.status)}</TableCell>
                            <TableCell className="text-right">
                              <Link to={`/admin/exams/${exam.id}/edit`}>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="text-center py-12 border rounded-md text-slate-500 bg-slate-50 dark:bg-slate-900/50">
                  No exams found for schedule view.
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedDates.map(dateStr => (
                    <div key={dateStr} className="relative">
                      <div className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-lg font-bold text-slate-800 dark:text-slate-200 mb-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                        {dateStr === 'TBD' ? 'To Be Determined' : format(new Date(dateStr), 'EEEE, MMMM do, yyyy')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {groupedExams[dateStr].sort((a,b) => a.startTime?.localeCompare(b.startTime)).map(exam => (
                          <Card key={exam.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">{exam.courseCode}</Badge>
                                {getStatusBadge(exam.status)}
                              </div>
                              <h3 className="font-semibold text-lg line-clamp-1 mb-1" title={exam.title}>{exam.title}</h3>
                              <p className="text-xs text-slate-500 mb-4 line-clamp-1">{exam.courseTitle}</p>
                              
                              <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md">
                                <div className="flex items-center text-slate-700 dark:text-slate-300">
                                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                                  <span className="font-medium">{exam.startTime} - {exam.endTime}</span>
                                  <span className="ml-2 text-xs text-slate-500">({exam.durationMinutes}m)</span>
                                </div>
                                <div className="flex items-center text-slate-700 dark:text-slate-300">
                                  <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                                  <span className="truncate">{exam.venue || 'No Venue Assigned'}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <Link to={`/admin/exams/${exam.id}/edit`}>
                                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-8">Manage Details</Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
