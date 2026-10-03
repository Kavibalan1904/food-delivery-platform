import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiUser, FiLogIn } from 'react-icons/fi'
import { MdRestaurant } from 'react-icons/md'
import axios from 'axios'

export default function AuthModal({ isOpen, onClose, mode, onToggleMode, onLogin, addToast }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleQuickFillDemo = () => {
    setFormData({
      name: 'Kavibalan',
      email: 'kavi@swiggy.in',
      password: 'password123',
      phone: '+91 98401 23456'
    })
  }

  const handleGoToPartner = () => {
    onClose()
    navigate('/partner')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        const res = await axios.post('/api/auth/register', formData)
        addToast('Account created successfully! Please sign in.', 'success')
        onToggleMode()
      } else {
        const res = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        })
        onLogin(res.data.user, res.data.token)
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Invalid email or password', 'error')
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
          {mode === 'login' ? 'Customer Sign In' : 'Create Account'}
        </h2>
        <p className="auth-modal-subtitle">
          {mode === 'login'
            ? 'Sign in with your email to order and track food live'
            : 'Join Swiggy Chennai for the best food delivery experience'
          }
        </p>

        {/* Quick Demo Fill Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={handleQuickFillDemo}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '8px',
              background: '#fff2e5', border: '1px dashed #fc8019',
              color: '#fc8019', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px'
            }}
          >
            ⚡ Auto-Fill Demo Credentials (kavi@swiggy.in)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="auth-name">Full Name</label>
              <input
                className="auth-input"
                id="auth-name"
                name="name"
                type="text"
                placeholder="Kavibalan"
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
              placeholder="kavi@swiggy.in"
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
                placeholder="+91 98401 23456"
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
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In as Customer' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span className="auth-toggle-link" onClick={onToggleMode}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>

        {/* Switch to Restaurant Partner Portal */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e2e7', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#7e808c', marginBottom: '8px' }}>
            Are you a restaurant owner or kitchen manager?
          </p>
          <button
            type="button"
            onClick={handleGoToPartner}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: '#02060c', color: '#ffffff',
              fontSize: '13px', fontWeight: 800, border: 'none',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <MdRestaurant /> Open Restaurant Partner Portal ➔
          </button>
        </div>
      </div>
    </div>
  )
}
