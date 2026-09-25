import { motion } from 'framer-motion';
import { Award, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardAcademicPerformance({ data }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full"
    >
      <Card className="p-6 h-full shadow-sm hover:shadow-md transition-shadow flex flex-col border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-indigo-500" size={20} />
            Academic Performance
          </h3>
          <Link to="/student/results" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30 text-center">
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-500 dark:text-indigo-400 mb-1">CGPA</p>
            <p className="text-3xl font-display font-bold text-indigo-700 dark:text-indigo-300">
              {data.cgpa || 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 text-center flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">Credits</p>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
              {data.totalEarnedCredits || 0}
            </p>
          </div>
        </div>

        {data.latestResult && (
          <div className="mt-auto">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3">Latest Result</p>
            <Link to={`/student/results/${data.latestResult.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <span className="font-bold">{data.latestResult.grade}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {data.latestResult.courseTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {data.latestResult.gradePoint} Grade Points
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0 ml-2" />
              </div>
            </Link>
          </div>
        )}
        
        {!data.latestResult && (
          <div className="mt-auto flex flex-col items-center justify-center py-4 text-center">
            <BookOpen size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">No results published yet</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
