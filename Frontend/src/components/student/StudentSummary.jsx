import { motion } from 'framer-motion';
import { User, Hash, GraduationCap, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function StudentSummary({ student }) {
  if (!student) return null;

  const initials = student.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const infoItems = [
    { label: 'Student ID', value: student.studentId, icon: Hash },
    { label: 'Program', value: student.program, icon: GraduationCap },
    { label: 'Semester', value: student.semester, icon: BookOpen },
    { label: 'Academic Year', value: student.academicYear, icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="group p-6 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-black/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-20 h-20 rounded-2xl ring-4 ring-slate-50 dark:ring-slate-900/50 shadow-sm flex-shrink-0">
            <AvatarImage src={student.avatarUrl} alt={student.name} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-2xl font-bold rounded-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {student.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{student.email}</p>
              </div>
              
              <Badge variant="secondary" className="mx-auto sm:mx-0 w-fit">
                <User size={12} className="mr-1" />
                Active Student
              </Badge>
            </div>

            <Separator className="my-4 hidden sm:block" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 sm:mt-0">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.value || (
                        <span className="text-slate-300 dark:text-slate-600 font-normal italic">Not set</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 flex justify-center sm:justify-start">
              <Link
                to="/student/profile"
                className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                View Profile
                <ChevronRight size={16} className="ml-1 translate-x-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
