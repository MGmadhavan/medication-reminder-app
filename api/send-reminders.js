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
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    console.log(`Checking for immediate medication reminders at ${currentTimeString} on ${today}`)
    
    const { data: allMedications, error } = await supabase
      .rpc('get_missed_medications', { target_date: today })

    if (error) {
      console.error('Error fetching medications:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Database error',
        error: error.message 
      })
    }

    if (!allMedications || allMedications.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No medications found for reminder check',
        emailsSent: 0 
      })
    }

    const currentTotalMinutes = currentHour * 60 + currentMinute
    
    const medicationsToRemind = allMedications.filter(med => {
      const [medHour, medMinute] = med.medication_time.split(':').map(Number)
      const medTime = medHour * 60 + medMinute
      
      const timeDifference = Math.abs(currentTotalMinutes - medTime)
      return timeDifference <= 1
    })

    if (medicationsToRemind.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No medications due for reminder right now',
        emailsSent: 0 
      })
    }

    const userMedications = medicationsToRemind.reduce((acc, med) => {
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

    for (const userId in userMedications) {
      const { user, medications } = userMedications[userId]
      
      const emailData = {
        to: user.caretaker_email,
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
          console.log(`Immediate reminder sent to ${user.caretaker_email}`)
        } else {
          console.error(`Failed to send immediate reminder to ${user.caretaker_email}`)
        }
      } catch (emailError) {
        console.error('Error sending immediate reminder:', emailError)
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Sent ${emailsSent} immediate reminder emails`,
      emailsSent,
      medicationsChecked: medicationsToRemind.length
    })

  } catch (error) {
    console.error('Error in immediate reminder check:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}
