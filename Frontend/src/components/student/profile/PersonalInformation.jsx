import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

function InfoRow({ label, value }) {
  return (
    <div className="py-3">
      <dt className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {value || <span className="text-slate-400 dark:text-slate-600 italic font-normal">Not provided</span>}
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

function formatGender(g) {
  if (!g) return null;
  const map = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
  };
  return map[g] || g;
}

export default function PersonalInformation({ student }) {
  const fullAddress = [student?.address, student?.city, student?.state, student?.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <User size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label="Full Name" value={student?.name} />
              <InfoRow label="Email" value={student?.email} />
              <InfoRow label="Phone" value={student?.phone} />
            </div>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label="Date of Birth" value={formatDate(student?.dateOfBirth)} />
              <InfoRow label="Gender" value={formatGender(student?.gender)} />
              <InfoRow label="Address" value={fullAddress || null} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
