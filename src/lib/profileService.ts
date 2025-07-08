import { supabase } from './supabase'
import { Profile } from '@/types'

export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createProfile(userId: string, email: string, profileData: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        ...profileData,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
