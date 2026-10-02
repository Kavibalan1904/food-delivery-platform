import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiMapPin, FiShoppingBag, FiX, FiChevronDown, FiCheck } from 'react-icons/fi'
import { MdDeliveryDining } from 'react-icons/md'

const CHENNAI_NEIGHBORHOODS = [
  'T. Nagar, Chennai',
  'Anna Nagar, Chennai',
  'Nungambakkam, Chennai',
  'Adyar, Chennai',
  'Velachery, Chennai',
  'Mylapore, Chennai',
  'Besant Nagar, Chennai',
  'Alwarpet, Chennai',
]

export default function Navbar({
  cartCount,
  onCartClick,
  onAuthClick,
  user,
  onLogout,
  searchQuery = '',
  onSearchChange,
  currentLocation = 'T. Nagar, Chennai',
  onLocationChange
}) {
  const [scrolled, setScrolled] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [activeLocation, setActiveLocation] = useState(currentLocation)
  const locationRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value)
    }
    if (location.pathname !== '/' && e.target.value.trim().length > 0) {
      navigate('/')
    }
  }

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  const handleSelectLocation = (loc) => {
    setActiveLocation(loc)
    setIsLocationOpen(false)
    if (onLocationChange) onLocationChange(loc)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="navbar-inner">
        <a className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="navbar-logo-icon">
            <MdDeliveryDining />
          </div>
          Swift<span style={{ color: 'var(--brand-primary)' }}>Bite</span>
        </a>

        <div className="navbar-search">
          <FiSearch className="navbar-search-icon" />
          <input
            className="navbar-search-input"
            type="text"
            placeholder="Search Chennai restaurants, Thalappakatti, Filter Coffee..."
            id="search-input"
            value={searchQuery}
            onChange={handleInputChange}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              style={{
                background: 'none', border: 'none', color: 'var(--text-tertiary)',
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
              }}
              title="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="navbar-actions">
          {/* Chennai Location Picker */}
          <div style={{ position: 'relative' }} ref={locationRef}>
            <button
              className="navbar-btn"
              id="location-btn"
              onClick={() => setIsLocationOpen(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiMapPin className="navbar-btn-icon" style={{ color: 'var(--brand-primary)' }} />
              <span>{activeLocation.split(',')[0]}</span>
              <FiChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {isLocationOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: 'var(--bg-card)', borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-medium)',
                padding: '8px', minWidth: '220px', zIndex: 1000
              }}>
                <div style={{
                  padding: '8px 12px 6px', fontSize: '0.75rem',
                  fontWeight: 700, color: 'var(--text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Deliver to in Chennai
                </div>
                {CHENNAI_NEIGHBORHOODS.map(loc => {
                  const isSelected = activeLocation === loc
                  return (
                    <button
                      key={loc}
                      onClick={() => handleSelectLocation(loc)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '10px 12px',
                        borderRadius: '10px', border: 'none',
                        background: isSelected ? 'var(--brand-gradient-subtle)' : 'transparent',
                        color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{loc}</span>
                      {isSelected && <FiCheck size={14} />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            className="navbar-btn"
            id="orders-nav-btn"
            onClick={() => navigate('/orders')}
            title="View Orders and Live Tracking"
          >
            <FiShoppingBag className="navbar-btn-icon" />
            <span>Orders</span>
          </button>

          {user ? (
            <>
              <button
                className="navbar-btn"
                id="user-profile-btn"
                onClick={() => navigate('/orders')}
                title="Profile & Orders"
              >
                <FiUser className="navbar-btn-icon" />
                <span>{user.name.split(' ')[0]}</span>
              </button>
              <button className="navbar-btn" onClick={onLogout} id="logout-btn" title="Logout">
                <FiLogOut className="navbar-btn-icon" />
              </button>
            </>
          ) : (
            <button className="navbar-btn" onClick={onAuthClick} id="login-btn">
              <FiUser className="navbar-btn-icon" />
              <span>Login</span>
            </button>
          )}

          <button className="navbar-cart" onClick={onCartClick} id="cart-btn">
            <FiShoppingCart />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="navbar-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
