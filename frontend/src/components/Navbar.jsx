import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiMapPin, FiShoppingBag, FiX, FiChevronDown, FiCheck, FiHelpCircle, FiPercent } from 'react-icons/fi'
import { MdRestaurant } from 'react-icons/md'

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
            title="Bite"
            style={{ cursor: 'pointer' }}
          >
            {/* Bite Speed B Vector Logo */}
            <svg
              className="swiggy-logo-svg"
              viewBox="0 0 500 500"
              width="44"
              height="44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="biteOrangeNav" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF9233" />
                  <stop offset="100%" stopColor="#FC8019" />
                </linearGradient>
              </defs>
              <rect width="500" height="500" rx="125" fill="url(#biteOrangeNav)" />
              <g transform="skewX(-10) translate(40, 0)">
                <polygon points="70,215 155,215 135,240 50,240" fill="white" />
                <polygon points="40,265 145,265 125,290 20,290" fill="white" />
                <polygon points="65,315 150,315 130,340 45,340" fill="white" opacity="0.9" />
                <path d="M160 120H285C345 120 380 152 380 205C380 238 358 264 320 276C365 288 392 318 392 362C392 418 345 448 285 448H160C146 448 135 437 135 423V145C135 131 146 120 160 120ZM205 180V244H276C298 244 316 232 316 212C316 192 298 180 276 180H205ZM205 316V388H282C308 388 326 374 326 352C326 330 308 316 282 316H205Z" fill="white" />
              </g>
            </svg>
            <span className="swiggy-wordmark">BITE</span>
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

          {/* Restaurant Partner Hub Link */}
          <div
            className="swiggy-nav-item"
            id="partner-nav-btn"
            onClick={() => navigate('/partner')}
            title="Restaurant Partner Kitchen Portal"
            style={{ color: '#fc8019', fontWeight: 700 }}
          >
            <div className="swiggy-nav-icon-wrap">
              <MdRestaurant size={18} />
            </div>
            <span>Partner Hub</span>
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
