import { motion } from 'framer-motion';
import { Clock, CalendarOff, MapPin, FileCheck, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DashboardUpcomingExams({ exams }) {
  if (!exams || exams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Card className="p-6 h-full border border-dashed shadow-none dark:border-slate-800">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            Upcoming Exams
          </h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 ring-8 ring-slate-50/50 dark:ring-slate-800/20">
              <CalendarOff size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No upcoming exams</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 max-w-[200px] mx-auto">
              You don't have any exams scheduled in the near future.
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="h-full"
    >
      <Card className="p-6 h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Upcoming Exams
          </h3>
          <a href="/student/exams" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View All
          </a>
        </div>

        <div className="space-y-4 flex-1">
          {exams.map((exam, index) => {
            const dateObj = new Date(exam.date);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            return (
              <a 
                href={`/student/exams/${exam.id}`}
                key={exam.id || index}
                className="group flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm hover:shadow"
              >
                <div className="flex flex-col items-center justify-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shrink-0 w-16 text-center">
                  <span className="text-xs font-semibold uppercase text-indigo-500 tracking-wider mb-0.5">{dateObj.toLocaleDateString('en-GB', { month: 'short' })}</span>
                  <span className="text-xl font-display font-bold text-indigo-700 dark:text-indigo-300 leading-none">{dateObj.getDate()}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {exam.courseTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{exam.title}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock size={12} className="text-slate-400" />
                      <span>{exam.startTime}</span>
                    </div>
                    {exam.venue && (
                      <div className="flex items-center gap-1 truncate">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{exam.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
