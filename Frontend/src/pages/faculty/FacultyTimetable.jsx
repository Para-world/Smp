import React, { useState, useEffect } from 'react';
import { fetchFacultyTimetable } from '../../services/facultyApi';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock, MapPin, BookOpen, CalendarDays, Laptop, MonitorPlay } from 'lucide-react';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

  const currentDayIndex = new Date().getDay();
  const todaysClasses = schedules.filter(s => s.dayOfWeek === currentDayIndex).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <FacultyLayout pageTitle="My Timetable">
      <div className="space-y-8 max-w-[1400px] mx-auto px-2">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              My Weekly Schedule
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              View your assigned classes and teaching responsibilities for the week.
            </p>
          </div>
        </div>

        {/* Today's Classes */}
        {!loading && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" /> Today's Classes
            </h2>
            {todaysClasses.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 py-4">No classes scheduled for today. Enjoy your day!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {todaysClasses.map(sch => (
                  <Card key={sch.id} className="group relative overflow-hidden rounded-xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className={`h-1.5 w-full ${sch.isOnline ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`} />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className={`font-semibold tracking-wide text-[10px] uppercase ${sch.isOnline ? 'border-blue-200 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-emerald-200 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                            {sch.classType}
                          </Badge>
                          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1" title={sch.courseTitle}>
                            {sch.courseCode}
                          </h3>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                          <Clock className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="font-medium">{sch.startTime} - {sch.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          {sch.isOnline ? <MonitorPlay className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-slate-400" />}
                          <span className="truncate font-medium">{sch.isOnline ? 'Online Meeting' : (sch.room || 'Room TBA')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-20 min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-500"></div>
              <p className="text-slate-500 font-medium">Loading schedule...</p>
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <CalendarDays className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Classes Assigned</h3>
            <p className="text-slate-500 dark:text-slate-500 max-w-md mb-6">You currently have no classes scheduled for this term. If you believe this is an error, please contact administration.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-2 sm:p-6">
            <Tabs defaultValue={DAYS.findIndex(d => schedulesByDay.find(s => s.dayName === d)?.classes.length > 0).toString() || "1"} className="w-full">
              <div className="overflow-x-auto pb-2 mb-6 hide-scrollbar">
                <TabsList className="h-12 w-full sm:w-auto inline-flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                  {DAYS.map((day, idx) => (
                    idx === 0 ? null : (
                      <TabsTrigger 
                        key={idx} 
                        value={idx.toString()}
                        className="rounded-lg px-6 font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                      >
                        {day}
                      </TabsTrigger>
                    )
                  ))}
                </TabsList>
              </div>

              {DAYS.map((dayName, index) => {
                if (index === 0) return null; // Skip Sunday
                const dayClasses = schedules.filter(s => s.dayOfWeek === index).sort((a, b) => a.startTime.localeCompare(b.startTime));
                
                return (
                  <TabsContent key={index} value={index.toString()} className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    {dayClasses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                          <CalendarDays className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-1">Free Day</h3>
                        <p className="text-slate-500 dark:text-slate-500 text-sm max-w-sm">No classes assigned on {dayName}.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {dayClasses.map(sch => (
                          <Card key={sch.id} className="group relative overflow-hidden rounded-2xl border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900">
                            {/* Decorative Top Accent */}
                            <div className={`h-1.5 w-full ${sch.isOnline ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`} />
                            
                            <CardContent className="p-5 pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                  <Badge variant="outline" className={`font-semibold tracking-wide text-[10px] uppercase ${sch.isOnline ? 'border-blue-200 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-emerald-200 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                    {sch.classType}
                                  </Badge>
                                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight line-clamp-1" title={sch.courseTitle}>
                                    {sch.courseCode}
                                  </h3>
                                </div>
                              </div>
                              
                              <div className="space-y-3 mt-5">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                                  <Clock className="h-4 w-4 text-emerald-500" />
                                  <span className="font-medium">{sch.startTime} <span className="text-slate-400 font-normal mx-1">to</span> {sch.endTime}</span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                  <div className="w-6 flex justify-center">
                                    {sch.isOnline ? <MonitorPlay className="h-4 w-4 text-blue-500" /> : <MapPin className="h-4 w-4 text-slate-400" />}
                                  </div>
                                  <span className="truncate font-medium">{sch.isOnline ? 'Online Meeting' : (sch.room || 'Room TBA')}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
