import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const authToken = req.headers['x-cron-token']
  if (authToken !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: missedMedications, error } = await supabase
      .rpc('get_missed_medications', { target_date: today })

    if (error) {
      console.error('Error fetching missed medications:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Database error',
        error: error.message 
      })
    }

    if (!missedMedications || missedMedications.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No missed medications found',
        emailsSent: 0 
      })
    }

    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute
    
    const actuallyMissed = missedMedications.filter(med => {
      const [medHour, medMinute] = med.medication_time.split(':').map(Number)
      const medTime = medHour * 60 + medMinute
      const gracePeriodMinutes = 30 // 30 minutes grace period for missed medication alerts
      
      return currentTotalMinutes >= (medTime + gracePeriodMinutes)
    })

    if (actuallyMissed.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No medications past grace period',
        emailsSent: 0 
      })
    }

    const userMissedMeds = actuallyMissed.reduce((acc, med) => {
      const userId = med.user_id
      if (!acc[userId]) {
        acc[userId] = {
          user: {
            email: med.user_email,
            full_name: med.user_full_name,
            caretaker_email: med.caretaker_email
          },
          medications: []
        }
      }
      acc[userId].medications.push({
        id: med.medication_id,
        name: med.medication_name,
        dosage: med.medication_dosage,
        time: med.medication_time
      })
      return acc
    }, {})

    let emailsSent = 0

    for (const userId in userMissedMeds) {
      const { user, medications } = userMissedMeds[userId]
      
      const emailData = {
        to: user.caretaker_email,
        from: 'noreply@medicationreminder.app',
        subject: `Medication Reminder Alert - ${user.full_name || user.email}`,
        html: `
          <h2>Medication Reminder Alert</h2>
          <p>Dear Caretaker,</p>
          <p>This is an automated alert from the Medication Reminder App.</p>
          <p>The following medications were missed today by <strong>${user.full_name || user.email}</strong>:</p>
          <ul>
            ${medications.map(med => `<li>${med.name} (${med.dosage}) at ${med.time}</li>`).join('')}
          </ul>
          <p>Please check in with them to ensure they take their medications.</p>
          <p>Best regards,<br>Medication Reminder App</p>
        `
      }

      try {
        const protocol = req.headers['x-forwarded-proto'] || 'http'
        const host = req.headers.host
        const response = await fetch(`${protocol}://${host}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        if (response.ok) {
          emailsSent++
          console.log(`Email sent to ${user.caretaker_email}`)
        } else {
          console.error(`Failed to send email to ${user.caretaker_email}`)
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError)
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Checked medications and sent ${emailsSent} email alerts`,
      emailsSent,
      missedMedications: actuallyMissed.length
    })

  } catch (error) {
    console.error('Error in medication check:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}
