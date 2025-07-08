import { supabase } from './supabase'
import { Medication, MedicationLog, CreateMedicationData } from '@/types'

export class MedicationService {
  static async getMedications(userId: string): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('time')
    
    if (error) throw error
    return data || []
  }

  static async createMedication(userId: string, medicationData: CreateMedicationData): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .insert({
        ...medicationData,
        user_id: userId,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteMedication(medicationId: string): Promise<void> {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', medicationId)
    
    if (error) throw error
  }

  static async markMedicationTaken(userId: string, medicationId: string, date: string): Promise<MedicationLog> {
    const { data, error } = await supabase
      .from('medication_logs')
      .insert({
        user_id: userId,
        medication_id: medicationId,
        date,
        taken_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getMedicationLogsForDate(userId: string, date: string): Promise<MedicationLog[]> {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
    
    if (error) throw error
    return data || []
  }

  static async isMedicationTakenToday(userId: string, medicationId: string, date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('medication_id', medicationId)
      .eq('date', date)
      .limit(1)
    
    if (error) throw error
    return (data || []).length > 0
  }

  static async getMissedMedications(userId: string): Promise<Medication[]> {
    const today = new Date().toISOString().split('T')[0]
    const medications = await this.getMedications(userId)
    const logs = await this.getMedicationLogsForDate(userId, today)
    const takenMedicationIds = new Set(logs.map(log => log.medication_id))
    
    return medications.filter(med => !takenMedicationIds.has(med.id))
  }
}
