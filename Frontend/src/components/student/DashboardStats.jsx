import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, BookOpen, FileText, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

function AnimatedNumber({ value }) {
  const numberRef = useRef(null);

  useEffect(() => {
    if (value !== undefined && value !== null && numberRef.current) {
      const isFloat = value % 1 !== 0;
      const targetValue = Number(value);

      if (isNaN(targetValue)) {
        numberRef.current.innerHTML = value;
        return;
      }

      const obj = { val: 0 };
      
      gsap.to(obj, {
        val: targetValue,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.innerHTML = isFloat 
              ? obj.val.toFixed(1) 
              : Math.floor(obj.val);
          }
        },
      });
    }
  }, [value]);

  if (value === undefined || value === null) return null;
  if (isNaN(Number(value))) return <span>{value}</span>;

  return <span ref={numberRef}>0</span>;
}

const statConfig = [
  {
    key: 'attendance',
    label: 'Attendance',
    icon: ClipboardCheck,
    suffix: '%',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    emptyText: 'No data yet',
  },
  {
    key: 'courses',
    label: 'Enrolled Courses',
    icon: BookOpen,
    suffix: '',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    emptyText: 'None',
  },
  {
    key: 'pendingAssignments',
    label: 'Pending Assignments',
    icon: FileText,
    suffix: '',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    emptyText: 'None',
  },
  {
    key: 'gpa',
    label: 'Current GPA',
    icon: TrendingUp,
    suffix: '',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    emptyText: 'No data yet',
  },
];

export default function DashboardStats({ statistics }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat, index) => {
        const value = statistics?.[stat.key];
        const hasValue = value !== null && value !== undefined;

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="group block relative"
          >
            <Card className="relative h-full overflow-hidden p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20">
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
                  stat.bgLight,
                  stat.bgDark
                )}
              >
                <stat.icon size={20} className={stat.iconColor} />
              </div>

              {/* Value */}
              <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {hasValue ? (
                  <>
                    <AnimatedNumber value={value} />
                    {stat.suffix && <span className="text-lg ml-0.5 text-slate-400">{stat.suffix}</span>}
                  </>
                ) : (
                  <span className="text-base font-medium text-slate-300 dark:text-slate-600">{stat.emptyText}</span>
                )}
              </p>

              {/* Label */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {stat.label}
              </p>

              {/* Subtle gradient accent line */}
              <div
                className={cn(
                  "absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  stat.gradient
                )}
              />
            </Card>
            {stat.key === 'attendance' && (
              <Link to="/student/attendance" className="absolute inset-0 z-10 rounded-xl" aria-label="View Attendance Details" />
            )}
            {stat.key === 'pendingAssignments' && (
              <Link to="/student/assignments" className="absolute inset-0 z-10 rounded-xl" aria-label="View Assignments" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
