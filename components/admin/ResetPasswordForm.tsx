'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ResetPasswordFormProps {
  email: string
  required?: boolean
}

export function ResetPasswordForm({ email, required = false }: ResetPasswordFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset password')
      }

      toast.success('Password reset successfully')
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/admin/dashboard')
        router.refresh()
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {required && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-500 text-sm">
            <strong>Password Reset Required:</strong> You must change your password before you can
            access the admin portal.
          </p>
        </div>
      )}

      <div>
        <Label className="text-gray-400 mb-2 block">Current Password</Label>
        <Input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          placeholder="Enter your current password"
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      <div>
        <Label className="text-gray-400 mb-2 block">New Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Enter new password"
            className="bg-gray-800 border-gray-700 text-white pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          Must be at least 8 characters long
        </p>
      </div>

      <div>
        <Label className="text-gray-400 mb-2 block">Confirm New Password</Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            className="bg-gray-800 border-gray-700 text-white pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Key className="w-4 h-4 mr-2" />
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </Button>

      {!required && (
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/dashboard')}
          className="w-full border-gray-700"
        >
          Cancel
        </Button>
      )}
    </form>
  )
}
