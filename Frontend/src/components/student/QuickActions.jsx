import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, FileText, Award, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

const actions = [
  {
    label: 'Courses',
    description: 'Explore your enrolled courses',
    icon: BookOpen,
    path: '/student/courses',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Attendance',
    description: 'Check your daily attendance',
    icon: ClipboardCheck,
    path: '/student/attendance',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Assignments',
    description: 'View pending assignments',
    icon: FileText,
    path: '/student/assignments',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Results',
    description: 'Check your latest results',
    icon: Award,
    path: '/student/results',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    label: 'Timetable',
    description: 'View your class schedule',
    icon: Calendar,
    path: '/student/timetable',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 + index * 0.06 }}
            className="group cursor-pointer block h-full"
            onClick={() => navigate(action.path)}
          >
            <Card className="flex flex-col h-full p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-4 transition-colors`}>
                <action.icon size={20} className={action.text} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {action.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {action.description}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                  Explore
                </span>
                <ArrowRight size={14} className="ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
