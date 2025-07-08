import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'demo_mode' && 
  supabaseAnonKey !== 'demo_mode' &&
  supabaseUrl.includes('supabase.co')

if (!hasValidSupabaseConfig) {
  console.error('❌ Missing or invalid Supabase configuration!')
  console.error('📝 Please check your .env file and ensure you have:')
  console.error('   VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.error('🔗 Get these from: https://supabase.com/dashboard → Your Project → Settings → API')
  throw new Error('Missing valid Supabase environment variables. Please check your .env file.')
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
