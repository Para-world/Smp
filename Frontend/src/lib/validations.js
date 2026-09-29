import { z } from 'zod';

export const studentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  program: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().min(1, "Semester must be at least 1").max(10, "Semester must be at most 10").optional().or(z.literal('')),
  academicYear: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active")
});
