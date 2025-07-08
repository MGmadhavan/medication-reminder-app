import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    caretaker_email: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!isLogin) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords don't match"
      }
      
      if (formData.caretaker_email && !/\S+@\S+\.\S+/.test(formData.caretaker_email)) {
        errors.caretaker_email = 'Invalid email format'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      console.log('Attempting login with:', formData.email)
      const { error } = await signIn(formData.email, formData.password)
      if (error) {
        console.error('Login error:', error)
        throw error
      }
      console.log('Login successful!')
    } catch (err: any) {
      console.error('Login failed:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      console.log('Attempting signup with:', formData.email)
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        caretaker_email: formData.caretaker_email,
      })
      if (error) {
        console.error('Signup error:', error)
        throw error
      }
      console.log('Signup successful!')
      setError('Account created successfully! You can now sign in.')
      setIsLogin(true)
    } catch (err: any) {
      console.error('Signup failed:', err)
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Medication Reminder App
          </p>
        </div>

        <Card>
          <CardContent className="space-y-6">
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
                placeholder="Enter your email (e.g., demo@example.com)"
                required
              />
              
              <Input
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={formErrors.password}
                placeholder="Enter your password (min 6 characters)"
                required
              />
              
              {!isLogin && (
                <>
                  <Input
                    type="password"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={formErrors.confirmPassword}
                    placeholder="Confirm your password"
                    required
                  />
                  
                  <Input
                    label="Full Name (Optional)"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    error={formErrors.full_name}
                    placeholder="Enter your full name"
                  />
                  
                  <Input
                    type="email"
                    label="Caretaker Email (Optional)"
                    value={formData.caretaker_email}
                    onChange={(e) => handleInputChange('caretaker_email', e.target.value)}
                    error={formErrors.caretaker_email}
                    placeholder="Enter caretaker's email"
                  />
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create account')}
              </Button>
            </form>

            {error && (
              <div className={`text-sm text-center p-3 rounded-md ${
                error.includes('successful') 
                  ? 'text-green-700 bg-green-50 border border-green-200'
                  : 'text-red-600 bg-red-50 border border-red-200'
              }`}>
                {error}
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormErrors({})
                }}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
