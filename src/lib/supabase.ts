import { createClient } from '@supabase/supabase-js'
 
// Fallback to hard-coded values if environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qphrmikkwzxvqgnzzxqr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaHJtaWtrd3p4dnFnbnp6eHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODYzNDksImV4cCI6MjA2NzQ2MjM0OX0.dt-6DXGw6g3OZvlkKRDqZTzTAT-c_JX_vg0Z9-eS6Us'
 
console.log('🔍 Environment Check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Missing')
console.log('Using environment variables:', !!import.meta.env.VITE_SUPABASE_URL)
console.log('Current URL:', supabaseUrl)
 
const hasValidSupabaseConfig = supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'demo_mode' &&
  supabaseAnonKey !== 'demo_mode' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey.startsWith('eyJ')
 
if (!hasValidSupabaseConfig) {
  console.error('❌ Missing or invalid Supabase configuration!')
  console.error('📝 Please check your .env file and ensure you have:')
  console.error('   VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.error('🔗 Get these from: https://supabase.com/dashboard → Your Project → Settings → API')
  console.error('Current values:')
  console.error('URL:', supabaseUrl || 'undefined')
  console.error('Key valid format:', supabaseAnonKey ? supabaseAnonKey.startsWith('eyJ') : false)
  // Don't throw error in production, use fallback values
}
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
 
console.log('✅ Supabase client initialized successfully!')
console.log('🔗 Connected to:', supabaseUrl)
 
export type Database = {
  public: {
    Tables: {
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string
          time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: string
          time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string
          time?: string
          created_at?: string
          updated_at?: string
        }
      }
      medication_logs: {
        Row: {
          id: string
          user_id: string
          medication_id: string
          taken_at: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_id: string
          taken_at?: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_id?: string
          taken_at?: string
          date?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          caretaker_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          caretaker_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          caretaker_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}