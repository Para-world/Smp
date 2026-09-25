import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

function InfoRow({ label, value, badge }) {
  return (
    <div className="py-3">
      <dt className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {badge ? (
          badge
        ) : value ? (
          value
        ) : (
          <span className="text-slate-400 dark:text-slate-600 italic font-normal">Not set</span>
        )}
      </dd>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AcademicInformation({ student }) {
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
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label="Student ID" value={student?.studentId} />
              <InfoRow label="Program" value={student?.program} />
              <InfoRow label="Department" value={student?.department} />
              <InfoRow label="Semester" value={
                student?.semester != null
                  ? typeof student.semester === 'number'
                    ? `Semester ${student.semester}`
                    : student.semester
                  : null
              } />
            </div>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label="Academic Year" value={student?.academicYear} />
              <InfoRow label="Enrollment Date" value={formatDate(student?.enrollmentDate)} />
              <InfoRow
                label="Academic Status"
                badge={
                  student?.status ? (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${statusColor[student.status] || ''}`}
                    >
                      {statusLabel[student.status] || student.status}
                    </Badge>
                  ) : null
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
