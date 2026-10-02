import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import axios from 'axios'

export default function AuthModal({ isOpen, onClose, mode, onToggleMode, onLogin, addToast }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        const res = await axios.post('/api/auth/register', formData)
        addToast('Account created successfully!')
        onToggleMode()
      } else {
        const res = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        })
        onLogin(res.data.user, res.data.token)
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`auth-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button
          className="cart-close"
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px' }}
        >
          <FiX />
        </button>

        <h2 className="auth-modal-title">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="auth-modal-subtitle">
          {mode === 'login'
            ? 'Sign in to access your orders and favorites'
            : 'Join SwiftBite for the best food delivery experience'
          }
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="auth-name">Full Name</label>
              <input
                className="auth-input"
                id="auth-name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="auth-email">Email</label>
            <input
              className="auth-input"
              id="auth-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="auth-password">Password</label>
            <input
              className="auth-input"
              id="auth-password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="auth-phone">Phone</label>
              <input
                className="auth-input"
                id="auth-phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span className="auth-toggle-link" onClick={onToggleMode}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}
