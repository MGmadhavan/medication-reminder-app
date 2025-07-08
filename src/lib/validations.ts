import { z } from 'zod'

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'), 
  time: z.string().min(1, 'Time is required'),
})

export const profileSchema = z.object({
  full_name: z.string().optional(),
  caretaker_email: z.string().email('Invalid email format').optional().or(z.literal('')),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().optional(),
  caretaker_email: z.string().email('Invalid email format').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type MedicationFormData = z.infer<typeof medicationSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
