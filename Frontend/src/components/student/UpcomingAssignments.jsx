import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, ArrowRight, Clock, FileText } from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';

export default function UpcomingAssignments({ assignments }) {
  const navigate = useNavigate();

  if (!assignments || assignments.length === 0) {
    return (
      <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 h-full flex flex-col">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Pending Assignments</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
            <Calendar size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">You're all caught up! 🎉</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">No pending assignments at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort assignments by nearest due date
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }).slice(0, 4);

  return (
    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" />
          Pending Assignments
        </CardTitle>
        <button 
          onClick={() => navigate('/student/assignments')}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {sortedAssignments.map((assignment, index) => {
            const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
            const pastDue = dueDate ? isPast(dueDate) : false;

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row gap-3 sm:items-center justify-between"
                onClick={() => navigate(`/student/assignments/${assignment.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-0.5">
                    {assignment.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {assignment.courseCode} • {assignment.courseTitle}
                  </p>
                </div>
                
                <div className="shrink-0 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  <Clock size={12} className={pastDue ? 'text-red-500' : 'text-slate-400'} />
                  <span className={`text-xs font-medium ${pastDue ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {dueDate ? formatDistanceToNow(dueDate, { addSuffix: true }) : 'No Due Date'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
