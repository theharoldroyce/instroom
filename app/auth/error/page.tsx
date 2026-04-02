'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    AccessDenied: 'Access was denied. Please check your credentials or settings.',
    OAuthSignin: 'Error signing in with OAuth provider.',
    OAuthCallback: 'Error in OAuth callback.',
    EmailSigninEmail: 'Error sending email.',
    CredentialsSignin: 'Invalid email or password.',
    SessionCallback: 'Your session is invalid.',
    Configuration: 'Server configuration error.',
  }

  const message = errorMessages[error as string] || 'An authentication error occurred.'

  return (
    <div className="flex items-center justify-center min-h-screen bg-offwhite">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">{message}</p>
        <p className="text-sm text-gray-500 mb-6">
          Error code: <code className="bg-gray-100 px-2 py-1 rounded">{error}</code>
        </p>
        <Link href="/login" className="block text-center bg-primary-green text-white py-2 rounded hover:bg-deep-green transition">
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-offwhite" />}>
      <AuthErrorContent />
    </Suspense>
  )
}
