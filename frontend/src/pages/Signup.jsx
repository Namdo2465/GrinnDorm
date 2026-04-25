import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Signup({ setUserId }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      setGeneratedCode(data.code)
      setStep('verify')
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      setUserId(data.user_id)
      navigate('/')
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Verify error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Create Account</h2>

      {error && <div className="error">{error}</div>}

      {step === 'email' ? (
        <form onSubmit={handleSignup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@grinnell.edu"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <div>
          <p style={{ marginBottom: '1rem' }}>
            A verification code has been sent to <strong>{email}</strong>
          </p>
          <p style={{ backgroundColor: '#e7f3ff', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            For testing purposes, your code is: <strong>{generatedCode}</strong>
          </p>
          <form onSubmit={handleVerify}>
            <label>Verification Code:</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength="6"
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setStep('email')
                setCode('')
                setGeneratedCode('')
              }}
              style={{ background: '#6c757d' }}
              disabled={loading}
            >
              Back
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
