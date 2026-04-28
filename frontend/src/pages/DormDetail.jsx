import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function DormDetail({ token }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dorm, setDorm] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchDormDetail()
  }, [id])

  const fetchDormDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dorms/${id}`)
      if (!response.ok) throw new Error('Dorm not found')
      const data = await response.json()
      setDorm(data.dorm)
      setReviews(data.reviews)
    } catch (err) {
      setError('Failed to load dorm details')
      console.error('Fetch dorm error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!token) {
      setSubmitError('Please sign up to submit a review')
      return
    }

    if (comment.trim().length === 0) {
      setSubmitError('Comment cannot be empty')
      return
    }

    setSubmitError('')
    setSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dorm_id: id,
          rating: parseInt(rating),
          comment
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Failed to submit review')
        return
      }

      setSubmitSuccess(true)
      setRating(5)
      setComment('')
      setTimeout(() => setSubmitSuccess(false), 3000)
      
      fetchDormDetail()
    } catch (err) {
      setSubmitError('Failed to submit review')
      console.error('Submit review error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container">Loading...</div>
  if (error) return <div className="container error">{error}</div>
  if (!dorm) return <div className="container error">Dorm not found</div>

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/')}
        style={{ marginBottom: '1rem', background: '#6c757d' }}
      >
        Back to Dorms
      </button>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>{dorm.name}</h2>
        <p><strong>Campus:</strong> {dorm.campus}</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {dorm.average_rating ? `${dorm.average_rating} / 5` : 'No ratings yet'}
            </div>
            <p>{dorm.review_count} reviews</p>
          </div>
          <a 
            href={dorm.external_link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            View Full Details
          </a>
        </div>
      </div>

      {token && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3>Submit a Review</h3>
          {submitError && <div className="error">{submitError}</div>}
          {submitSuccess && <div className="success">Review submitted successfully!</div>}
          
          <form onSubmit={handleSubmitReview}>
            <label>Rating:</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(e.target.value)}
              disabled={submitting}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>

            <label>Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              disabled={submitting}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h3>Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p style={{ color: '#999' }}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review">
              <div className="review-header">
                <span className="anonymous-name">{review.anonymous_name}</span>
                <span className="review-rating">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <p className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
