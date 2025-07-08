import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmailService } from '@/lib/emailService'
import { useAuth } from '@/contexts/AuthContext'

export function TestEmailPage() {
  const [result, setResult] = useState<string>('')
  const [reminderResult, setReminderResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)
  const { user } = useAuth()

  const handleTestMissedEmail = async () => {
    if (!user) {
      setResult('❌ Please log in first')
      return
    }

    setLoading(true)
    setResult('🔄 Checking for missed medications...')

    try {
      const response = await EmailService.testMissedMedicationCheck()
      setResult(`✅ Missed medication test: ${response.message}`)
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestReminderEmail = async () => {
    if (!user) {
      setReminderResult('❌ Please log in first')
      return
    }

    setReminderLoading(true)
    setReminderResult('🔔 Checking for immediate medication reminders...')

    try {
      const response = await EmailService.testImmediateReminders()
      setReminderResult(`✅ Immediate reminder test: ${response.message}`)
    } catch (error) {
      setReminderResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setReminderLoading(false)
    }
  }

  const currentTime = new Date().toLocaleTimeString()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Email Notification Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Current time: {currentTime}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔔 Immediate Reminders</h3>
              <div className="text-sm text-gray-600 mb-3">
                Test immediate reminders sent at the exact scheduled medication time (within 1 minute).
              </div>
              <Button 
                onClick={handleTestReminderEmail} 
                disabled={reminderLoading || !user}
                className="w-full mb-2"
              >
                {reminderLoading ? 'Checking...' : 'Test Immediate Reminders'}
              </Button>
              {reminderResult && (
                <div className="p-3 bg-blue-50 rounded-md text-sm font-mono whitespace-pre-wrap">
                  {reminderResult}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">⚠️ Missed Medication Alerts</h3>
              <div className="text-sm text-gray-600 mb-3">
                Test alerts for medications that should have been taken but weren't marked as done.
                Medications are considered "missed" if they're 30 minutes past their scheduled time.
              </div>
              <Button 
                onClick={handleTestMissedEmail} 
                disabled={loading || !user}
                className="w-full mb-2"
              >
                {loading ? 'Checking...' : 'Test Missed Medication Alerts'}
              </Button>
              {result && (
                <div className="p-3 bg-red-50 rounded-md text-sm font-mono whitespace-pre-wrap">
                  {result}
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-3">
            <strong>Note:</strong> For actual email sending to work, you need:
            <ul className="mt-1 ml-4 list-disc">
              <li>SendGrid API key configured</li>
              <li>Caretaker email set in your profile</li>
              <li>API routes deployed and working</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
