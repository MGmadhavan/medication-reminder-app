import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { medicationSchema, type MedicationFormData } from '@/lib/validations'
import { MedicationService } from '@/lib/medicationService'
import { useAuth } from '@/contexts/AuthContext'
import { Medication } from '@/types'

interface MedicationListProps {
  medications: Medication[]
  onMedicationAdded: () => void
  onMedicationDeleted: () => void
  onMedicationTaken: () => void
  takenMedications: Set<string>
}

export function MedicationList({ 
  medications, 
  onMedicationAdded, 
  onMedicationDeleted, 
  onMedicationTaken,
  takenMedications 
}: MedicationListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    mode: 'onSubmit', // Only validate on form submission
    reValidateMode: 'onChange', // Re-validate on change after first submission attempt
    defaultValues: {
      name: '',
      dosage: '',
      time: '',
    },
  })

  const handleAddMedication = async (data: MedicationFormData) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      await MedicationService.createMedication(user.id, data)
      form.reset()
      setShowAddForm(false)
      onMedicationAdded()
    } catch (err: any) {
      setError(err.message || 'Failed to add medication')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedication = async (medicationId: string) => {
    setLoading(true)
    try {
      await MedicationService.deleteMedication(medicationId)
      onMedicationDeleted()
    } catch (err: any) {
      setError(err.message || 'Failed to delete medication')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkTaken = async (medicationId: string) => {
    if (!user) return

    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await MedicationService.markMedicationTaken(user.id, medicationId, today)
      onMedicationTaken()
    } catch (err: any) {
      setError(err.message || 'Failed to mark medication as taken')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Medications</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={form.handleSubmit(handleAddMedication)} 
              className="space-y-4"
            >
              <Input
                {...form.register('name')}
                label="Medication Name"
                error={form.formState.errors.name?.message}
                placeholder="e.g., Aspirin"
              />
              <Input
                {...form.register('dosage')}
                label="Dosage"
                error={form.formState.errors.dosage?.message}
                placeholder="e.g., 100mg"
              />
              <Input
                {...form.register('time')}
                type="time"
                label="Time"
                error={form.formState.errors.time?.message}
              />
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Medication'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    form.reset()
                    setShowAddForm(false)
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {medications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
              <p className="text-gray-500">Add your first medication to get started.</p>
            </CardContent>
          </Card>
        ) : (
          medications.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                  <p className="text-sm text-gray-600">
                    {medication.dosage} • {medication.time}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {takenMedications.has(medication.id) ? (
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">Taken</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleMarkTaken(medication.id)}
                      disabled={loading}
                    >
                      Mark Taken
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteMedication(medication.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
