export interface MockUser {
  id: string
  email: string
}

export interface MockSession {
  user: MockUser
}

let mockUser: MockUser | null = null
let mockMedications: any[] = []
let mockLogs: any[] = []

export const supabase = {
  auth: {
    getSession: async () => {
      return { 
        data: { session: mockUser ? { user: mockUser } : null },
        error: null
      }
    },
    
    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_IN', mockUser ? { user: mockUser } : null)
      }, 100)
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    },
    
    signInWithPassword: async ({ email, password: _password }: { email: string, password: string }) => {
      // Mock successful login
      mockUser = {
        id: 'mock-user-123',
        email: email
      }
      return { data: { user: mockUser }, error: null }
    },
    
    signUp: async ({ email, password: _password, options: _options }: any) => {
      // Mock successful signup
      mockUser = {
        id: 'mock-user-123',
        email: email
      }
      return { data: { user: mockUser }, error: null }
    },
    
    signOut: async () => {
      mockUser = null
      mockMedications = []
      mockLogs = []
      return { error: null }
    }
  },
  
  from: (table: string) => ({
    select: (_columns?: string) => ({
      eq: (_column: string, value: any) => ({
        order: (_column: string) => ({
          then: () => Promise.resolve({ 
            data: table === 'medications' ? mockMedications : mockLogs, 
            error: null 
          })
        }),
        limit: (_num: number) => Promise.resolve({ 
          data: table === 'medication_logs' ? mockLogs.filter(log => log.medication_id === value) : [], 
          error: null 
        }),
        single: () => Promise.resolve({ 
          data: table === 'profiles' ? { 
            id: mockUser?.id, 
            email: mockUser?.email, 
            full_name: 'Demo User',
            caretaker_email: 'caretaker@example.com' 
          } : null, 
          error: null 
        })
      }),
      single: () => Promise.resolve({ 
        data: { 
          id: mockUser?.id, 
          email: mockUser?.email, 
          full_name: 'Demo User',
          caretaker_email: 'caretaker@example.com' 
        }, 
        error: null 
      })
    }),
    
    insert: (data: any) => ({
      select: () => ({
        single: () => {
          const newItem = { 
            ...data, 
            id: 'mock-id-' + Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          if (table === 'medications') {
            mockMedications.push(newItem)
          } else if (table === 'medication_logs') {
            mockLogs.push(newItem)
          }
          
          return Promise.resolve({ data: newItem, error: null })
        }
      })
    }),
    
    delete: () => ({
      eq: (_column: string, value: any) => {
        if (table === 'medications') {
          mockMedications = mockMedications.filter(med => med.id !== value)
        }
        return Promise.resolve({ error: null })
      }
    }),
    
    update: (data: any) => ({
      eq: (_column: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { ...data, id: value }, error: null })
        })
      })
    })
  })
}

// Mock database types for development
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
