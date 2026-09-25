import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, Clock, FileWarning } from 'lucide-react';

export default function AttendanceCourseCard({ course, delay = 0 }) {
  const navigate = useNavigate();

  // Status categories
  let statusText = 'Good';
  let statusColor = 'text-emerald-600 dark:text-emerald-400';
  let progressColor = 'bg-emerald-500';

  if (course.percentage < 75) {
    statusText = 'Needs Attention';
    statusColor = 'text-red-600 dark:text-red-400';
    progressColor = 'bg-red-500';
  } else if (course.percentage < 90) {
    statusText = 'Good';
    statusColor = 'text-blue-600 dark:text-blue-400';
    progressColor = 'bg-blue-500';
  } else {
    statusText = 'Excellent';
    statusColor = 'text-indigo-600 dark:text-indigo-400';
    progressColor = 'bg-indigo-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow group">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <Badge variant="outline" className="w-fit mb-2 font-mono text-xs bg-slate-50 dark:bg-slate-800/50">
            {course.code}
          </Badge>
          <CardTitle className="font-display text-lg font-bold leading-tight line-clamp-2">
            {course.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-end justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Attendance</span>
            <div className="text-right">
              <span className={`text-2xl font-bold font-display ${statusColor}`}>
                {course.percentage}%
              </span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${progressColor} transition-all duration-1000 ease-out`} 
                style={{ width: `${course.percentage}%` }} 
              />
            </div>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
              {statusText}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2 border-y border-slate-100 dark:border-slate-800 py-3">
            <div>
              <div className="text-slate-400 mb-1 flex justify-center"><CheckCircle2 size={14} className="text-emerald-500" /></div>
              <span className="font-semibold">{course.present}</span>
            </div>
            <div>
              <div className="text-slate-400 mb-1 flex justify-center"><XCircle size={14} className="text-red-500" /></div>
              <span className="font-semibold">{course.absent}</span>
            </div>
            <div>
              <div className="text-slate-400 mb-1 flex justify-center"><Clock size={14} className="text-amber-500" /></div>
              <span className="font-semibold">{course.late}</span>
            </div>
            <div>
              <div className="text-slate-400 mb-1 flex justify-center"><FileWarning size={14} className="text-blue-500" /></div>
              <span className="font-semibold">{course.excused}</span>
            </div>
          </div>

          <div className="mt-auto pt-2">
            <Button 
              className="w-full justify-between group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors"
              variant="outline"
              onClick={() => navigate(`/student/attendance/${course.courseId}`)}
            >
              View Details
              <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
