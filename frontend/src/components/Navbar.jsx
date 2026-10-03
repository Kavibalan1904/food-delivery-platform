import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiMapPin, FiShoppingBag, FiX, FiChevronDown, FiCheck, FiHelpCircle, FiPercent } from 'react-icons/fi'

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
  const [isSearchActive, setIsSearchActive] = useState(false)
  const locationRef = useRef(null)
  const searchInputRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5)
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
    setIsSearchActive(false)
  }

  const handleSelectLocation = (loc) => {
    setActiveLocation(loc)
    setIsLocationOpen(false)
    if (onLocationChange) onLocationChange(loc)
  }

  const handleSearchNavClick = () => {
    if (location.pathname !== '/') {
      navigate('/')
    }
    setIsSearchActive(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  return (
    <nav className={`swiggy-navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="swiggy-navbar-inner">
        {/* Left Side: Swiggy Logo + Location Selector */}
        <div className="swiggy-nav-left">
          <a
            className="swiggy-logo"
            onClick={() => navigate('/')}
            title="Swiggy"
            style={{ cursor: 'pointer' }}
          >
            {/* Authentic Swiggy Orange Pin/S Vector Logo */}
            <svg
              className="swiggy-logo-svg"
              viewBox="0 0 500 500"
              width="44"
              height="44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="500" height="500" rx="120" fill="#FC8019" />
              <path
                d="M250 85C170 85 105 150 105 230C105 295 185 390 242 452C246.5 456.8 253.5 456.8 258 452C315 390 395 295 395 230C395 150 330 85 250 85ZM250 165C286 165 315 194 315 230C315 266 286 295 250 295C214 295 185 266 185 230C185 194 214 165 250 165Z"
                fill="white"
              />
            </svg>
            <span className="swiggy-wordmark">SWIGGY</span>
          </a>

          {/* Swiggy Location Selector */}
          <div className="swiggy-location-wrapper" ref={locationRef}>
            <button
              className="swiggy-location-btn"
              id="location-btn"
              onClick={() => setIsLocationOpen(prev => !prev)}
            >
              <span className="swiggy-location-title">
                {activeLocation.split(',')[0]}
              </span>
              <span className="swiggy-location-sub">
                Chennai, Tamil Nadu, India
              </span>
              <FiChevronDown className={`swiggy-location-arrow ${isLocationOpen ? 'open' : ''}`} />
            </button>

            {isLocationOpen && (
              <div className="swiggy-location-dropdown">
                <div className="swiggy-location-dropdown-header">
                  <FiMapPin style={{ color: '#FC8019' }} />
                  <span>Choose Delivery Location in Chennai</span>
                </div>
                <div className="swiggy-location-list">
                  {CHENNAI_NEIGHBORHOODS.map(loc => {
                    const isSelected = activeLocation === loc
                    return (
                      <button
                        key={loc}
                        onClick={() => handleSelectLocation(loc)}
                        className={`swiggy-location-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontWeight: 700, color: isSelected ? '#FC8019' : '#02060c' }}>
                            {loc.split(',')[0]}
                          </span>
                          <span style={{ fontSize: '12px', color: '#7e808c' }}>
                            Chennai, Tamil Nadu
                          </span>
                        </div>
                        {isSelected && <FiCheck style={{ color: '#FC8019' }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Inline Search (Swiggy Style Instant Search) */}
        <div className={`swiggy-search-box ${isSearchActive || searchQuery ? 'active' : ''}`}>
          <FiSearch className="swiggy-search-icon" />
          <input
            ref={searchInputRef}
            className="swiggy-search-input"
            type="text"
            placeholder="Search for restaurants and food..."
            id="search-input"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => {
              if (!searchQuery) setIsSearchActive(false)
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="swiggy-search-clear"
              title="Clear search"
            >
              <FiX size={15} />
            </button>
          )}
        </div>

        {/* Right Side: Swiggy Navigation Links */}
        <div className="swiggy-nav-right">
          {/* Swiggy Offers Link */}
          <div
            className="swiggy-nav-item"
            onClick={() => {
              navigate('/')
              if (onSearchChange) onSearchChange('')
            }}
            title="Special Offers"
          >
            <div className="swiggy-nav-icon-wrap">
              <FiPercent size={18} />
            </div>
            <span>Offers</span>
            <span className="swiggy-badge-new">NEW</span>
          </div>

          {/* Orders / Live Tracking Link */}
          <div
            className="swiggy-nav-item"
            id="orders-nav-btn"
            onClick={() => navigate('/orders')}
            title="Your Orders"
          >
            <div className="swiggy-nav-icon-wrap">
              <FiShoppingBag size={18} />
            </div>
            <span>Orders</span>
          </div>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="swiggy-user-menu">
              <div
                className="swiggy-nav-item"
                id="user-profile-btn"
                onClick={() => navigate('/orders')}
                title="Profile & Orders"
              >
                <div className="swiggy-nav-icon-wrap">
                  <FiUser size={18} />
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button
                className="swiggy-logout-btn"
                onClick={onLogout}
                id="logout-btn"
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div
              className="swiggy-nav-item"
              onClick={onAuthClick}
              id="login-btn"
            >
              <div className="swiggy-nav-icon-wrap">
                <FiUser size={18} />
              </div>
              <span>Sign In</span>
            </div>
          )}

          {/* Swiggy Cart Button */}
          <div
            className="swiggy-nav-cart"
            onClick={onCartClick}
            id="cart-btn"
          >
            <div className="swiggy-cart-icon-wrap">
              <FiShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="swiggy-cart-badge">{cartCount}</span>
              )}
            </div>
            <span className="swiggy-cart-label">Cart</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
