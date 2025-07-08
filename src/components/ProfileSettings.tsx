import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileService } from '@/lib/profileService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { User, Mail, Save } from 'lucide-react'
import { Profile } from '@/types'

export function ProfileSettings() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    caretaker_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const profileData = await ProfileService.getProfile(user.id)
      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || '',
          caretaker_email: profileData.caretaker_email || ''
        })
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (message) setMessage('')
    if (error) setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    if (formData.caretaker_email && !/\S+@\S+\.\S+/.test(formData.caretaker_email)) {
      setError('Please enter a valid email address for the caretaker')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const updatedProfile = await ProfileService.updateProfile(user.id, {
        full_name: formData.full_name || null,
        caretaker_email: formData.caretaker_email || null
      })
      
      setProfile(updatedProfile)
      setMessage('Profile updated successfully!')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Current Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md border">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-900">{user?.email}</span>
                <span className="ml-2 text-xs text-gray-500">(cannot be changed)</span>
              </div>
            </div>

            {/* Full Name */}
            <Input
              type="text"
              label="Full Name (Optional)"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
            />

            {/* Caretaker Email */}
            <div>
              <Input
                type="email"
                label="Caretaker Email"
                value={formData.caretaker_email}
                onChange={(e) => handleInputChange('caretaker_email', e.target.value)}
                placeholder="Enter caretaker's email for notifications"
              />
              <p className="mt-1 text-xs text-gray-500">
                This email will receive notifications when you miss medications
              </p>
            </div>

            {/* Messages */}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Save Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>

          {/* Current Settings Display */}
          {profile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="text-gray-900">{profile.full_name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Caretaker Email:</span>
                  <span className="text-gray-900">{profile.caretaker_email || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email Notifications:</span>
                  <span className={`font-medium ${profile.caretaker_email ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.caretaker_email ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
