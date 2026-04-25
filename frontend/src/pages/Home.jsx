import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Home({ userId }) {
  const navigate = useNavigate()
  const [dorms, setDorms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDorms()
  }, [])

  const fetchDorms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dorms`)
      if (!response.ok) throw new Error('Failed to fetch dorms')
      const data = await response.json()
      setDorms(data)
    } catch (err) {
      setError('Failed to load dorms')
      console.error('Fetch dorms error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDormClick = (dormId) => {
    navigate(`/dorms/${dormId}`)
  }

  if (loading) return <div className="container">Loading dorms...</div>
  if (error) return <div className="container error">{error}</div>

  const northDorms = dorms.filter(d => d.campus === 'North')
  const southDorms = dorms.filter(d => d.campus === 'South')
  const eastDorms = dorms.filter(d => d.campus === 'East')
  const offCampusDorms = dorms.filter(d => d.campus === 'Off-campus')

  return (
    <div className="container">
      <h2>GrinnDorm - Dorm Ratings</h2>
      {!userId && (
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          <p>Please sign up or verify your email to submit reviews.</p>
        </div>
      )}

      <h3>North Campus</h3>
      <div>
        {northDorms.map(dorm => (
          <div 
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: '#999' }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3>South Campus</h3>
      <div>
        {southDorms.map(dorm => (
          <div 
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: '#999' }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3>East Campus</h3>
      <div>
        {eastDorms.map(dorm => (
          <div 
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: '#999' }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3>Off-Campus</h3>
      <div>
        {offCampusDorms.map(dorm => (
          <div 
            key={dorm.id}
            className="dorm-card"
            onClick={() => handleDormClick(dorm.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{dorm.name}</h3>
                <p>{dorm.review_count} reviews</p>
              </div>
              {dorm.average_rating ? (
                <div className="rating">{dorm.average_rating} / 5</div>
              ) : (
                <div style={{ color: '#999' }}>No rating yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
