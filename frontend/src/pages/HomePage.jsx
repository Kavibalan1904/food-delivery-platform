import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar, FiClock, FiMapPin, FiHeart, FiTrendingUp, FiFilter } from 'react-icons/fi'
import { MdDeliveryDining } from 'react-icons/md'
import axios from 'axios'

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'biryani', name: 'Biryani', icon: '🍚' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burger', name: 'Burgers', icon: '🍔' },
  { id: 'chinese', name: 'Chinese', icon: '🥡' },
  { id: 'south_indian', name: 'South Indian', icon: '🥘' },
  { id: 'north_indian', name: 'North Indian', icon: '🫓' },
  { id: 'dessert', name: 'Desserts', icon: '🍰' },
  { id: 'ice_cream', name: 'Ice Cream', icon: '🍦' },
  { id: 'beverages', name: 'Drinks', icon: '🥤' },
]

const FILTERS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Rating 4.0+' },
  { id: 'delivery_time', label: 'Fast Delivery' },
  { id: 'cost_low', label: 'Cost: Low to High' },
  { id: 'offers', label: 'Great Offers' },
  { id: 'new', label: 'New on SwiftBite' },
]

export default function HomePage({ addToCart, searchQuery = '', onSearchChange }) {
  const [restaurants, setRestaurants] = useState([])
  const [trendingDishes, setTrendingDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeFilter, setActiveFilter] = useState('relevance')
  const [favorites, setFavorites] = useState(new Set())
  const [heroInput, setHeroInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchRestaurants()
  }, [activeCategory])

  useEffect(() => {
    fetchTrendingDishes()
  }, [])

  const fetchTrendingDishes = async () => {
    try {
      const res = await axios.get('/api/restaurants/dishes/trending')
      setTrendingDishes(res.data || [])
    } catch (err) {
      console.error('Failed to fetch trending dishes:', err)
    }
  }

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const params = activeCategory !== 'all' ? { cuisine: activeCategory } : {}
      const res = await axios.get('/api/restaurants', { params })
      setRestaurants(res.data || [])
    } catch (err) {
      console.error('Failed to fetch restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleHeroSearch = (e) => {
    e?.preventDefault()
    if (onSearchChange && heroInput) {
      onSearchChange(heroInput)
    }
    const section = document.getElementById('restaurants-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleClearAllFilters = () => {
    setActiveCategory('all')
    setActiveFilter('relevance')
    if (onSearchChange) onSearchChange('')
    setHeroInput('')
  }

  // Filter and sort restaurants
  const displayedRestaurants = restaurants
    .filter(r => {
      // Search query filtering
      const query = searchQuery.trim().toLowerCase()
      if (!query) return true
      const matchesName = r.name?.toLowerCase().includes(query)
      const matchesCuisine = r.cuisines?.some(c => c.toLowerCase().includes(query))
      const matchesAddress = r.address?.toLowerCase().includes(query)
      return matchesName || matchesCuisine || matchesAddress
    })
    .filter(r => {
      // Filter chips
      if (activeFilter === 'rating') return r.rating >= 4.0
      if (activeFilter === 'offers') return Boolean(r.offer)
      return true
    })
    .sort((a, b) => {
      if (activeFilter === 'rating') return b.rating - a.rating
      if (activeFilter === 'delivery_time') return a.delivery_time - b.delivery_time
      if (activeFilter === 'cost_low') return a.price_for_two - b.price_for_two
      if (activeFilter === 'new') return b.rating - a.rating
      return 0
    })

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="hero" id="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Lightning Fast Delivery
              </div>
              <h1 className="hero-title">
                Craving something{' '}
                <span className="hero-title-highlight">delicious?</span>
              </h1>
              <p className="hero-description">
                Explore Chennai's best flavors — from authentic Thalappakatti Biryani and crispy Podi Idlis
                to gourmet wood-fired pizza and cafe treats delivered in under 30 minutes across Singara Chennai.
              </p>
              <form className="hero-search" onSubmit={handleHeroSearch}>
                <input
                  className="hero-search-input"
                  type="text"
                  placeholder="Search Thalappakatti, Podi Idli, Chicken 65, Pizza..."
                  id="hero-search-input"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                />
                <button className="hero-search-btn" type="submit" id="hero-search-btn">
                  Find Food
                </button>
              </form>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-value">500+</div>
                  <div className="hero-stat-label">Restaurants</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">50K+</div>
                  <div className="hero-stat-label">Happy Customers</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">25 min</div>
                  <div className="hero-stat-label">Avg. Delivery</div>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop"
                  alt="Delicious food"
                />
                <div className="hero-floating-card">
                  <div className="hero-floating-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <MdDeliveryDining />
                  </div>
                  <div className="hero-floating-text">
                    <strong>Free Delivery</strong>
                    <span>On orders above ₹299</span>
                  </div>
                </div>
                <div className="hero-floating-card">
                  <div className="hero-floating-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                    <FiTrendingUp />
                  </div>
                  <div className="hero-floating-text">
                    <strong>50% OFF</strong>
                    <span>On your first order</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="categories" id="categories-section">
        <div className="container">
          <h2 className="section-title">What's on your mind?</h2>
          <p className="section-subtitle">Explore by cuisine category</p>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                id={`category-${cat.id}`}
              >
                <div className="category-icon">{cat.icon}</div>
                <span className="category-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR CHENNAI DISHES ===== */}
      {!searchQuery && trendingDishes.length > 0 && (
        <section className="section" id="trending-dishes-section" style={{ paddingBottom: '10px' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '4px' }}>🔥 Chennai's Most-Loved Dishes</h2>
                <p className="section-subtitle" style={{ margin: 0 }}>Iconic signatures ordered by thousands of foodies across Chennai daily</p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {trendingDishes.slice(0, 8).map(dish => (
                <div
                  key={dish._id}
                  className="food-card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={() => navigate(`/restaurant/${dish.restaurant_id}`)}
                >
                  <div className="food-card-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div className={`food-card-veg ${dish.is_veg ? '' : 'non-veg'}`} title={dish.is_veg ? 'Pure Veg' : 'Non-Veg'} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                        ★ Top Pick
                      </span>
                    </div>
                    <h3 className="food-card-name" style={{ fontSize: '0.95rem' }}>{dish.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                      {dish.restaurant_name}
                    </p>
                    <p className="food-card-price">₹{dish.price}</p>
                  </div>
                  <div className="food-card-image" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'
                      }}
                    />
                    <button
                      className="food-card-add-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart({ ...dish, restaurant_id: dish.restaurant_id })
                      }}
                    >
                      ADD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== RESTAURANTS ===== */}
      <section className="section" id="restaurants-section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '4px' }}>Restaurants near you</h2>
              <p className="section-subtitle" style={{ margin: 0 }}>
                {searchQuery
                  ? `Showing results for "${searchQuery}" (${displayedRestaurants.length} found)`
                  : `Discover ${displayedRestaurants.length} top dining spots across Chennai`}
              </p>
            </div>
            {(activeCategory !== 'all' || activeFilter !== 'relevance' || searchQuery) && (
              <button
                onClick={handleClearAllFilters}
                style={{
                  background: 'none', border: '1px solid var(--border-medium)',
                  padding: '6px 14px', borderRadius: '10px',
                  color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="filters">
            <div className="filter-chip" style={{
              background: 'var(--neutral-200)',
              borderColor: 'transparent',
              gap: '4px'
            }}>
              <FiFilter size={14} /> Filters
            </div>
            {FILTERS.map(f => (
              <div
                key={f.id}
                className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="restaurants-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="restaurant-card">
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: '16px 20px' }}>
                    <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedRestaurants.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', borderRadius: '24px',
              border: 'var(--border-light)', margin: '20px 0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                No restaurants matched your filters
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Try searching with a different cuisine name or clear existing filters.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleClearAllFilters}
                style={{ padding: '10px 24px', borderRadius: '12px' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="restaurants-grid">
              {displayedRestaurants.map(restaurant => (
                <div
                  key={restaurant._id}
                  className="restaurant-card"
                  onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  id={`restaurant-${restaurant._id}`}
                >
                  <div className="restaurant-card-image">
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'
                      }}
                    />
                    {restaurant.offer && (
                      <div className="restaurant-card-offer">{restaurant.offer}</div>
                    )}
                    <button
                      className={`restaurant-card-favorite ${favorites.has(restaurant._id) ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant._id) }}
                      aria-label="Add to favorites"
                    >
                      <FiHeart />
                    </button>
                  </div>
                  <div className="restaurant-card-body">
                    <div className="restaurant-card-header">
                      <h3 className="restaurant-card-name">{restaurant.name}</h3>
                      <div className="restaurant-card-rating">
                        <FiStar size={12} /> {restaurant.rating}
                      </div>
                    </div>
                    <p className="restaurant-card-cuisines">{restaurant.cuisines.join(', ')}</p>
                    <div className="restaurant-card-meta">
                      <span className="restaurant-card-meta-item">
                        <FiClock className="restaurant-card-meta-icon" size={14} />
                        {restaurant.delivery_time} min
                      </span>
                      <span className="restaurant-card-meta-item">
                        <FiMapPin className="restaurant-card-meta-icon" size={14} />
                        {restaurant.distance} km
                      </span>
                      <span className="restaurant-card-meta-item">
                        ₹{restaurant.price_for_two} for two
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

