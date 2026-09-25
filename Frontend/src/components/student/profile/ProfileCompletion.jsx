import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PROFILE_FIELDS = [
  { key: 'name', label: 'Full name' },
  { key: 'email', label: 'Email address' },
  { key: 'phone', label: 'Phone number' },
  { key: 'dateOfBirth', label: 'Date of birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'address', label: 'Address' },
  { key: 'avatarUrl', label: 'Profile photo', suggestion: 'Add your profile photo' },
  { key: 'emergencyContactName', label: 'Emergency contact', suggestion: 'Add emergency contact' },
];

export default function ProfileCompletion({ student }) {
  if (!student) return null;

  const completed = PROFILE_FIELDS.filter((f) => {
    const val = student[f.key];
    return val !== null && val !== undefined && val !== '';
  });

  const percentage = Math.round((completed.length / PROFILE_FIELDS.length) * 100);
  const missing = PROFILE_FIELDS.filter((f) => {
    const val = student[f.key];
    return val === null || val === undefined || val === '';
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Completion</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {percentage}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={percentage} className="h-3" />

          {percentage === 100 ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">Your profile is complete!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Complete your profile by adding:
              </p>
              <ul className="space-y-1.5">
                {missing.map((field) => (
                  <li
                    key={field.key}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    {field.suggestion || `Add your ${field.label.toLowerCase()}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
