import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

export default function ProfileHeader({ student, onEdit, onAvatarUpdated }) {
  const statusColor = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const statusLabel = {
    active: 'Active',
    inactive: 'Inactive',
    graduated: 'Graduated',
    suspended: 'Suspended',
    on_leave: 'On Leave',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        {/* Gradient banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>

        <CardContent className="relative px-6 pb-6 pt-0">
          {/* Avatar - offset upwards over the banner */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12">
            <ProfileAvatar student={student} onAvatarUpdated={onAvatarUpdated} />

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {student?.name || 'Student'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Student ID: {student?.studentId || '—'}
                  </p>
                  {student?.program && (
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                      {student.program}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {student?.semester && (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {typeof student.semester === 'number'
                          ? `Semester ${student.semester}`
                          : student.semester}
                      </span>
                    )}
                    {student?.semester && student?.academicYear && (
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                    )}
                    {student?.academicYear && (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {student.academicYear}
                      </span>
                    )}
                    {student?.status && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ml-1 ${statusColor[student.status] || ''}`}
                      >
                        {statusLabel[student.status] || student.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0 mt-1 sm:mt-0"
                >
                  <Pencil size={14} />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
