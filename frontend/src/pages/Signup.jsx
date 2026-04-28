import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Signup({ setToken }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
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

      setToken(data.token)
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
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Check your email inbox (and spam folder) for the 6-digit code. It expires in 10 minutes.
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
