import { supabase } from './supabase'
import { 
  MissedMedicationGroup, 
  EmailServiceResponse,
  Profile,
  Medication
} from '@/types'

interface EmailData {
  to: string
  from: string
  subject: string
  html: string
}

export class EmailService {
  static async sendImmediateReminders(): Promise<EmailServiceResponse> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const currentTime = new Date()
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      console.log(`Checking for medication reminders at ${currentTimeString} on ${today}`)
      
      const { data: allMedications, error: medicationsError } = await supabase
        .rpc('get_missed_medications', { target_date: today })

      if (medicationsError) {
        console.error('Error fetching medications:', medicationsError)
        return { success: false, message: `Database error: ${medicationsError.message}` }
      }

      if (!allMedications || allMedications.length === 0) {
        console.log('No medications found for reminder check')
        return { success: true, message: 'No medications found', emailsSent: 0 }
      }

      const medicationsToRemind = allMedications.filter((med: any) => {
        const [medHour, medMinute] = med.medication_time.split(':').map(Number)
        const medTime = medHour * 60 + medMinute
        const currentTotalMinutes = currentHour * 60 + currentMinute
        
        const timeDifference = Math.abs(currentTotalMinutes - medTime)
        const shouldRemind = timeDifference <= 1
        
        console.log(`Medication ${med.medication_name} at ${med.medication_time}: scheduled=${medTime}min, current=${currentTotalMinutes}min, timeDiff=${timeDifference}, shouldRemind=${shouldRemind}`)
        return shouldRemind
      })

      console.log(`Found ${medicationsToRemind.length} medications due for immediate reminder`)

      if (medicationsToRemind.length === 0) {
        return { success: true, message: 'No medications due for reminder right now', emailsSent: 0 }
      }

      const userMedications = this.groupMissedMedicationsByUser(medicationsToRemind)
      
      let emailsSent = 0
      for (const userId in userMedications) {
        const { user, medications } = userMedications[userId]
        const success = await this.sendImmediateReminderEmail(user, medications)
        if (success) emailsSent++
      }

      return { 
        success: true, 
        message: `Sent ${emailsSent} medication reminder emails`,
        emailsSent 
      }

    } catch (error) {
      console.error('Error in sendImmediateReminders:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  static async checkAndSendMissedMedicationAlerts(): Promise<EmailServiceResponse> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const currentTime = new Date()
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      console.log(`Checking for missed medications at ${currentTimeString} on ${today}`)
      
      const { data: missedMedications, error: missedError } = await supabase
        .rpc('get_missed_medications', { target_date: today })

      if (missedError) {
        console.error('Error fetching missed medications:', missedError)
        return { success: false, message: `Database error while fetching missed medications: ${missedError.message}` }
      }

      if (!missedMedications || missedMedications.length === 0) {
        console.log('No missed medications found')
        return { success: true, message: 'No missed medications found', emailsSent: 0 }
      }

      console.log(`Found ${missedMedications.length} missed medications`)

      const actuallyMissed = missedMedications.filter((med: any) => {
        const [medHour, medMinute] = med.medication_time.split(':').map(Number)
        const medTime = medHour * 60 + medMinute
        const currentTotalMinutes = currentHour * 60 + currentMinute
        
        const gracePeriodMinutes = 30
        const isPastDue = currentTotalMinutes >= (medTime + gracePeriodMinutes)
        
        console.log(`Medication ${med.medication_name} at ${med.medication_time}: scheduled=${medTime}min, current=${currentTotalMinutes}min, pastDue=${isPastDue}`)
        return isPastDue
      })

      console.log(`Found ${actuallyMissed.length} actually missed medications (past grace period)`)

      if (actuallyMissed.length === 0) {
        return { success: true, message: 'No medications past grace period', emailsSent: 0 }
      }

      const userMissedMeds = this.groupMissedMedicationsByUser(actuallyMissed)

      let emailsSent = 0
      for (const userId in userMissedMeds) {
        const { user, medications } = userMissedMeds[userId]
        const success = await this.sendMissedMedicationEmail(user, medications)
        if (success) emailsSent++
      }

      return { 
        success: true, 
        message: `Medication check completed. ${emailsSent} emails sent.`,
        emailsSent 
      }

    } catch (error) {
      console.error('Error in checkAndSendMissedMedicationAlerts:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  private static groupMissedMedicationsByUser(
    medications: any[]
  ): Record<string, MissedMedicationGroup> {
    return medications.reduce((acc: Record<string, MissedMedicationGroup>, med: any) => {
      const userId = med.user_id
      if (!acc[userId]) {
        acc[userId] = {
          user: {
            id: userId,
            email: med.user_email,
            full_name: med.user_full_name,
            caretaker_email: med.caretaker_email,
            created_at: '',
            updated_at: ''
          },
          medications: []
        }
      }
      acc[userId].medications.push({
        id: med.medication_id,
        name: med.medication_name,
        dosage: med.medication_dosage,
        time: med.medication_time,
        user_id: med.user_id,
        created_at: '',
        updated_at: ''
      })
      return acc
    }, {})
  }

  private static async sendMissedMedicationEmail(user: Profile, medications: Medication[]): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to: user.caretaker_email || '',
        from: 'noreply@medicationreminder.app',
        subject: `⚠️ Missed Medication Alert - ${user.full_name || user.email}`,
        html: `
          <h2>⚠️ Missed Medication Alert</h2>
          <p>Dear Caretaker,</p>
          <p>This is an urgent alert from the Medication Reminder App.</p>
          <p>The following medications were <strong>MISSED</strong> today by <strong>${user.full_name || user.email}</strong>:</p>
          <ul>
            ${medications.map(med => `<li><strong>${med.name}</strong> (${med.dosage}) - was scheduled for ${med.time}</li>`).join('')}
          </ul>
          <p><strong>Please check in with them immediately to ensure they take their missed medications.</strong></p>
          <p>Best regards,<br>Medication Reminder App</p>
        `
      }

      console.log(`Sending email to: ${user.caretaker_email}`)
      console.log('Email content:', emailData.html)

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Email sending failed: ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()
        console.log(`Email sent successfully to ${user.caretaker_email}:`, result)
        return true
      } catch (emailError) {
        console.error('Failed to send email via API:', emailError)
        console.log('EMAIL FALLBACK - Would have sent:', emailData)
        return false
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  private static async sendImmediateReminderEmail(user: Profile, medications: Medication[]): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to: user.caretaker_email || '',
        from: 'noreply@medicationreminder.app',
        subject: `🔔 Medication Reminder - ${user.full_name || user.email}`,
        html: `
          <h2>🔔 Medication Reminder</h2>
          <p>Dear Caretaker,</p>
          <p>This is a friendly reminder from the Medication Reminder App.</p>
          <p>It's time for <strong>${user.full_name || user.email}</strong> to take the following medication(s):</p>
          <ul>
            ${medications.map(med => `<li><strong>${med.name}</strong> (${med.dosage}) - scheduled for ${med.time}</li>`).join('')}
          </ul>
          <p>Please remind them to take their medication now.</p>
          <p>Best regards,<br>Medication Reminder App</p>
        `
      }

      console.log(`Sending immediate reminder to: ${user.caretaker_email}`)
      console.log('Email content:', emailData.html)

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Email sending failed: ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()
        console.log(`Immediate reminder sent successfully to ${user.caretaker_email}:`, result)
        return true
      } catch (emailError) {
        console.error('Failed to send immediate reminder via API:', emailError)
        console.log('EMAIL FALLBACK - Would have sent immediate reminder:', emailData)
        return false
      }
    } catch (error) {
      console.error('Failed to send immediate reminder:', error)
      return false
    }
  }

  static async testImmediateReminders(): Promise<EmailServiceResponse> {
    console.log('🔔 Manual test: Checking for immediate medication reminders...')
    const result = await this.sendImmediateReminders()
    console.log('🔔 Immediate reminder test result:', result)
    return result
  }

  static async testMissedMedicationCheck(): Promise<EmailServiceResponse> {
    console.log('🧪 Manual test: Checking for missed medications...')
    const result = await this.checkAndSendMissedMedicationAlerts()
    console.log('🧪 Test result:', result)
    return result
  }

  static async handleScheduledCheck(): Promise<EmailServiceResponse> {
    return await this.checkAndSendMissedMedicationAlerts()
  }
}
