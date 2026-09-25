import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone } from 'lucide-react';

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

export default function ContactInformation({ student }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Phone size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            Contact Information
          </CardTitle>
          <CardDescription>
            Keep your contact information up to date so the university can reach you when needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label="Email" value={student?.email} />
              <InfoRow label="Phone" value={student?.phone} />
            </div>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label="Emergency Contact" value={student?.emergencyContactName} />
              <InfoRow label="Emergency Phone" value={student?.emergencyContactPhone} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
