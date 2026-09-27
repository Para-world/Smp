import React, { useState, useEffect } from 'react';
import { fetchFacultyTimetable } from '../../services/facultyApi';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock, MapPin, BookOpen } from 'lucide-react';
import FacultyLayout from '../../components/faculty/FacultyLayout';

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function FacultyTimetable() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyTimetable();
      setSchedules(data);
    } catch (error) {
      toast.error('Failed to load your timetable');
    } finally {
      setLoading(false);
    }
  };

  const schedulesByDay = DAYS.map((dayName, index) => {
    return {
      dayIndex: index,
      dayName,
      classes: schedules.filter(s => s.dayOfWeek === index)
    };
  });

  return (
    <FacultyLayout pageTitle="My Timetable">
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Weekly Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View your assigned classes across the week</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No classes assigned</h3>
            <p className="text-slate-500 mt-2">You currently have no classes scheduled for this term.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {schedulesByDay.map(({ dayIndex, dayName, classes }) => {
              if (classes.length === 0) return null;
              
              return (
                <div key={dayIndex} className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2 text-slate-800 dark:text-slate-200">{dayName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {classes.map(sch => (
                      <Card key={sch.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-2 w-full bg-emerald-500" />
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg leading-tight truncate pr-2" title={sch.courseTitle}>
                              {sch.courseCode}
                            </h3>
                          </div>
                          
                          <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>{sch.startTime} - {sch.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-amber-500" />
                              <span className="truncate">{sch.isOnline ? 'Online' : (sch.room || 'TBA')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-purple-500" />
                              <span className="capitalize">{sch.classType}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
