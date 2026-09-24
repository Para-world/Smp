import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

export default function AcademicProgress({ semesterProgress, activeSemester }) {
  const hasData = semesterProgress !== null && semesterProgress !== undefined;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (hasData) {
      const timer = setTimeout(() => setProgress(semesterProgress), 500);
      return () => clearTimeout(timer);
    }
  }, [semesterProgress, hasData]);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="h-full"
      >
        <Card className="p-6 h-full border border-dashed shadow-none dark:border-slate-800 flex flex-col justify-center text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
              <GraduationCap size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Results not available
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Progress will appear here once your semester begins.
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
      transition={{ duration: 0.5, delay: 0.45 }}
      className="h-full"
    >
      <Card className="p-6 h-full shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-5 tracking-tight">
          Academic Progress
        </h3>

        <div className="space-y-6">
          {/* Semester progress bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester Completion</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{semesterProgress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Semester info */}
          {activeSemester && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {activeSemester.name}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(activeSemester.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' — '}
                  {new Date(activeSemester.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
