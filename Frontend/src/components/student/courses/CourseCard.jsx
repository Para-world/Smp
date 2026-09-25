import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Clock, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const statusColor = {
  enrolled: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dropped: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  waitlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const statusLabel = {
  enrolled: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
  waitlisted: 'Waitlisted',
};

export default function CourseCard({ course, delay = 0 }) {
  const navigate = useNavigate();
  
  const instructorInitials = course.faculty?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow group">
        <CardContent className="p-6 flex flex-col h-full gap-4">
          <div className="flex justify-between items-start gap-4">
            <Badge variant="outline" className="font-mono text-xs bg-slate-50 dark:bg-slate-800/50">
              {course.code}
            </Badge>
            <Badge 
              variant="secondary" 
              className={`text-[10px] uppercase tracking-wider font-bold ${statusColor[course.status] || ''}`}
            >
              {statusLabel[course.status] || course.status}
            </Badge>
          </div>

          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
            {course.title}
          </h3>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-800">
              <AvatarImage src={course.faculty?.avatarUrl} alt={course.faculty?.name} />
              <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-xs">
                {instructorInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {course.faculty?.name || 'Instructor TBA'}
            </span>
          </div>

          <div className="mt-auto pt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-500" />
              <span>{course.credits} Credits</span>
            </div>
            {course.semester?.name && (
              <div className="flex items-center gap-1.5 justify-end">
                <span>{course.semester.name}</span>
              </div>
            )}
            {course.schedule && (
              <div className="flex items-center gap-1.5 col-span-2 mt-1">
                <Clock size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">{course.schedule}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
            <Button 
              className="w-full justify-between group-hover:bg-indigo-600 group-hover:text-white transition-colors"
              variant="outline"
              onClick={() => navigate(`/student/courses/${course.id}`)}
            >
              View Course Details
              <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
