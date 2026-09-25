import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { updateStudentProfile } from '@/services/studentApi';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z
    .string()
    .regex(/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone format')
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  dateOfBirth: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say', ''])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  address: z.string().max(500).optional().nullable().transform((v) => (v === '' ? null : v)),
  city: z.string().max(100).optional().nullable().transform((v) => (v === '' ? null : v)),
  state: z.string().max(100).optional().nullable().transform((v) => (v === '' ? null : v)),
  postalCode: z.string().max(20).optional().nullable().transform((v) => (v === '' ? null : v)),
  emergencyContactName: z.string().max(255).optional().nullable().transform((v) => (v === '' ? null : v)),
  emergencyContactPhone: z
    .string()
    .regex(/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone format')
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
});

function FormField({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors';

export default function EditProfileDialog({ open, onOpenChange, student, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: student?.name || '',
      phone: student?.phone || '',
      dateOfBirth: student?.dateOfBirth || '',
      gender: student?.gender || '',
      address: student?.address || '',
      city: student?.city || '',
      state: student?.state || '',
      postalCode: student?.postalCode || '',
      emergencyContactName: student?.emergencyContactName || '',
      emergencyContactPhone: student?.emergencyContactPhone || '',
    },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    setServerError(null);
    try {
      await updateStudentProfile(data);
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setServerError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto bg-white dark:bg-[#0B1120]"
        data-lenis-prevent
      >
        <SheetHeader className="px-1">
          <SheetTitle className="font-display text-xl">Edit Profile</SheetTitle>
          <SheetDescription>
            Update your personal information. Academic fields are managed by your institution.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 px-1">
          {/* Personal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Personal Details
            </h4>
            <div className="space-y-4">
              <FormField label="Full Name *" error={errors.name?.message}>
                <input {...register('name')} className={inputClass} placeholder="Your full name" />
              </FormField>

              <FormField label="Phone" error={errors.phone?.message} hint="e.g. +91 98765 43210">
                <input {...register('phone')} className={inputClass} placeholder="+91 98765 43210" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Gender" error={errors.gender?.message}>
                  <select {...register('gender')} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </FormField>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Address
            </h4>
            <div className="space-y-4">
              <FormField label="Street Address" error={errors.address?.message}>
                <input {...register('address')} className={inputClass} placeholder="123 Main Street" />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="City" error={errors.city?.message}>
                  <input {...register('city')} className={inputClass} placeholder="Mumbai" />
                </FormField>
                <FormField label="State" error={errors.state?.message}>
                  <input {...register('state')} className={inputClass} placeholder="Maharashtra" />
                </FormField>
                <FormField label="Postal Code" error={errors.postalCode?.message}>
                  <input {...register('postalCode')} className={inputClass} placeholder="400001" />
                </FormField>
              </div>
            </div>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Name" error={errors.emergencyContactName?.message}>
                <input
                  {...register('emergencyContactName')}
                  className={inputClass}
                  placeholder="Parent / Guardian name"
                />
              </FormField>
              <FormField label="Contact Phone" error={errors.emergencyContactPhone?.message}>
                <input
                  {...register('emergencyContactPhone')}
                  className={inputClass}
                  placeholder="+91 98765 43210"
                />
              </FormField>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !isDirty} className="gap-1.5">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
