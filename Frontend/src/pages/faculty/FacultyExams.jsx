import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFacultyExams } from '../../services/facultyApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, Calendar, Clock, MapPin, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function FacultyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyExams();
      setExams(data);
    } catch (error) {
      toast.error(error.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'SCHEDULED': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
      case 'ONGOING': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ongoing</Badge>;
      case 'COMPLETED': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
      case 'POSTPONED': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Postponed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-slate-500 dark:text-slate-400">Schedule and manage exams for your courses</p>
        </div>
        <Link to="/faculty/exams/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Schedule Exam
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : exams.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed">
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Exams Scheduled</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
            You haven't scheduled any exams for your courses yet.
          </p>
          <Link to="/faculty/exams/create">
            <Button>Schedule an Exam</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {exams.map(exam => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-xl mb-1 line-clamp-1">{exam.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-primary/80">
                      <span className="bg-primary/10 px-2 py-0.5 rounded text-xs whitespace-nowrap">{exam.courseCode}</span>
                      <span className="truncate max-w-[150px]">{exam.courseTitle}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 opacity-70 flex-shrink-0" />
                    <span>{exam.date ? format(new Date(exam.date), 'EEEE, MMM d, yyyy') : 'No Date Set'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 opacity-70 flex-shrink-0" />
                    <span>
                      {exam.startTime} - {exam.endTime} ({exam.durationMinutes} mins)
                    </span>
                  </div>
                  {exam.venue && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 opacity-70 flex-shrink-0" />
                      <span className="truncate">{exam.venue}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
