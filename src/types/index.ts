export interface Medication {
  id: string
  user_id: string
  name: string
  dosage: string
  time: string
  created_at: string
  updated_at: string
}

export interface MedicationLog {
  id: string
  user_id: string
  medication_id: string
  taken_at: string
  date: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  caretaker_email: string | null
  created_at: string
  updated_at: string
}

export interface CreateMedicationData {
  name: string
  dosage: string
  time: string
}

export interface User {
  id: string
  email: string
}

export interface EmailData {
  to: string
  from: string
  subject: string
  html: string
}

export interface MedicationWithProfile extends Medication {
  profiles: Profile
}

export interface MissedMedicationGroup {
  user: Profile
  medications: Medication[]
}

export interface EmailServiceResponse {
  success: boolean
  message: string
  emailsSent?: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface AppError extends Error {
  code?: string
  details?: unknown
}
