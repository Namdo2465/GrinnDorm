import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Verify({ setToken }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send code')
        return
      }

      setCodeSent(true)
      setCode('')
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running.')
      console.error('Send-code error:', err)
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
      setError('Failed to connect to server. Make sure backend is running.')
      console.error('Verify error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>

      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Already have an account? Log in with your email.
      </p>

      {error && <div className="error">{error}</div>}

      {!codeSent ? (
        <form onSubmit={handleSendCode}>
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
        <form onSubmit={handleVerify}>
          <label>Email:</label>
          <p style={{ marginBottom: '1rem', color: '#666' }}>{email}</p>

          <label>Verification Code:</label>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Check your email for the 6-digit verification code. It expires in 10 minutes.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the 6-digit code"
            maxLength="6"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => setCodeSent(false)}
            style={{ marginTop: '1rem', background: '#f0f0f0', color: '#333' }}
            disabled={loading}
          >
            Back
          </button>
        </form>
      )}

      <p style={{ marginTop: '2rem', color: '#666' }}>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  )
}
