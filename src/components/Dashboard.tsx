import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MedicationList } from '@/components/MedicationList'
import { TestEmailPage } from '@/components/TestEmailPage'
import { ProfileSettings } from '@/components/ProfileSettings'
import { Button } from '@/components/ui/Button'
import { LogOut, Mail, Settings, ArrowLeft } from 'lucide-react'
import { MedicationService } from '@/lib/medicationService'
import { ProfileService } from '@/lib/profileService'
import { Medication, Profile } from '@/types'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [takenMedications, setTakenMedications] = useState<Set<string>>(new Set())
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEmailTest, setShowEmailTest] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const loadData = async () => {
    if (!user) return

    try {
      const [meds, logs, profileData] = await Promise.all([
        MedicationService.getMedications(user.id),
        MedicationService.getMedicationLogsForDate(user.id, new Date().toISOString().split('T')[0]),
        ProfileService.getProfile(user.id)
      ])
      
      setMedications(meds)
      setTakenMedications(new Set(logs.map(log => log.medication_id)))
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getUserInitials = () => {
    const displayName = getDisplayName()
    if (displayName === 'User') return 'U'
    
    const nameParts = displayName.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return displayName.substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Medication Reminder
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{getDisplayName()}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEmailTest(!showEmailTest)
                  setShowProfile(false)
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Test Email
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowProfile(!showProfile)
                  setShowEmailTest(false)
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {showEmailTest ? (
          <div>
            <div className="mb-6">
              <Button 
                variant="secondary" 
                onClick={() => setShowEmailTest(false)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Medications
              </Button>
            </div>
            <TestEmailPage />
          </div>
        ) : showProfile ? (
          <div>
            <div className="mb-6">
              <Button 
                variant="secondary" 
                onClick={() => setShowProfile(false)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Medications
              </Button>
            </div>
            <ProfileSettings />
          </div>
        ) : (
          <MedicationList
            medications={medications}
            takenMedications={takenMedications}
            onMedicationAdded={loadData}
            onMedicationDeleted={loadData}
            onMedicationTaken={loadData}
          />
        )}
      </main>
    </div>
  )
}
