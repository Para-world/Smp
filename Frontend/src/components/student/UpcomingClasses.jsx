import { motion } from 'framer-motion';
import { Clock, MapPin, User, CalendarOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function UpcomingClasses({ classes }) {
  if (!classes || classes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Card className="p-6 h-full border border-dashed shadow-none dark:border-slate-800">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            Upcoming Classes
          </h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 ring-8 ring-slate-50/50 dark:ring-slate-800/20">
              <CalendarOff size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No upcoming classes</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 max-w-[200px] mx-auto">
              Your timetable will appear here once it's been set up.
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
            Today's Schedule
          </h3>
          <a href="/student/timetable" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Timetable
          </a>
        </div>

        <div className="relative flex-1 space-y-0 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.courseId || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3"
            >
              {/* Timeline marker */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0B1120] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-[.is-active]:bg-indigo-50 dark:group-[.is-active]:bg-indigo-900/30 group-[.is-active]:text-indigo-600 dark:group-[.is-active]:text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors duration-300">
                <Clock size={16} />
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050811] shadow-sm group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 transition-colors duration-300">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {cls.courseTitle}
                  </h4>
                  {cls.schedule && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      {cls.schedule.split('-')[0]?.trim() || cls.schedule}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-3">
                  {cls.courseCode}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {cls.location && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                      <MapPin size={12} className="text-slate-400" />
                      {cls.location}
                    </span>
                  )}
                  {cls.faculty && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                      <User size={12} className="text-slate-400" />
                      {cls.faculty}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
