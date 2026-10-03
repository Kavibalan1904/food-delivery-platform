import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiStar, FiClock, FiMapPin, FiHeart, FiTrendingUp, FiFilter,
  FiChevronLeft, FiChevronRight, FiPercent, FiCheck, FiChevronDown
} from 'react-icons/fi'
import axios from 'axios'

const SWIGGY_CUISINE_CAROUSEL = [
  { id: 'all', name: 'All Dishes', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=260&h=260&fit=crop' },
  { id: 'biryani', name: 'Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=260&h=260&fit=crop' },
  { id: 'pizza', name: 'Pizzas', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=260&h=260&fit=crop' },
  { id: 'burger', name: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=260&h=260&fit=crop' },
  { id: 'south_indian', name: 'South Indian', img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=260&h=260&fit=crop' },
  { id: 'north_indian', name: 'North Indian', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=260&h=260&fit=crop' },
  { id: 'chinese', name: 'Chinese', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=260&h=260&fit=crop' },
  { id: 'dessert', name: 'Cakes & Desserts', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=260&h=260&fit=crop' },
  { id: 'beverages', name: 'Coffee & Drinks', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=260&h=260&fit=crop' },
]

const SWIGGY_FILTER_PILLS = [
  { id: 'relevance', label: 'Relevance (Default)' },
  { id: 'fast_delivery', label: 'Fast Delivery' },
  { id: 'rating_4plus', label: 'Ratings 4.0+' },
  { id: 'pure_veg', label: 'Pure Veg 🌱' },
  { id: 'offers', label: 'Offers 🏷️' },
  { id: 'cost_low', label: 'Cost: Low to High' },
  { id: 'cost_high', label: 'Cost: High to Low' },
  { id: 'under_300', label: 'Less than ₹300' },
]

export default function HomePage({ addToCart, searchQuery = '', onSearchChange }) {
  const [restaurants, setRestaurants] = useState([])
  const [trendingDishes, setTrendingDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeFilter, setActiveFilter] = useState('relevance')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const navigate = useNavigate()

  const carouselRef = useRef(null)
  const topChainsRef = useRef(null)

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

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleClearAllFilters = () => {
    setActiveCategory('all')
    setActiveFilter('relevance')
    if (onSearchChange) onSearchChange('')
  }

  // Filter and sort restaurants
  const displayedRestaurants = restaurants
    .filter(r => {
      const query = searchQuery.trim().toLowerCase()
      if (!query) return true
      const matchesName = r.name?.toLowerCase().includes(query)
      const matchesCuisine = r.cuisines?.some(c => c.toLowerCase().includes(query))
      const matchesAddress = r.address?.toLowerCase().includes(query)
      return matchesName || matchesCuisine || matchesAddress
    })
    .filter(r => {
      if (activeFilter === 'rating_4plus') return r.rating >= 4.0
      if (activeFilter === 'offers') return Boolean(r.offer)
      if (activeFilter === 'under_300') return r.price_for_two <= 300
      if (activeFilter === 'pure_veg') {
        // Murugan idli, desserts are typically vegetarian
        return r.cuisines?.some(c => ['South Indian', 'Dessert', 'Bakery', 'Breakfast', 'Beverages'].includes(c))
      }
      return true
    })
    .sort((a, b) => {
      if (activeFilter === 'rating_4plus') return b.rating - a.rating
      if (activeFilter === 'fast_delivery') return a.delivery_time - b.delivery_time
      if (activeFilter === 'cost_low') return a.price_for_two - b.price_for_two
      if (activeFilter === 'cost_high') return b.price_for_two - a.price_for_two
      return 0
    })

  return (
    <div className="swiggy-homepage">
      {/* ===== SECTION 1: WHAT'S ON YOUR MIND? (SWIGGY FOOD CAROUSEL) ===== */}
      <section className="swiggy-section" id="cuisine-carousel-section">
        <div className="swiggy-container">
          <div className="swiggy-section-header">
            <h2 className="swiggy-section-title">What's on your mind?</h2>
            <div className="swiggy-carousel-controls">
              <button
                className="swiggy-arrow-btn"
                onClick={() => scrollCarousel(carouselRef, 'left')}
                aria-label="Scroll left"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                className="swiggy-arrow-btn"
                onClick={() => scrollCarousel(carouselRef, 'right')}
                aria-label="Scroll right"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="swiggy-dish-carousel" ref={carouselRef}>
            {SWIGGY_CUISINE_CAROUSEL.map(item => {
              const isActive = activeCategory === item.id
              return (
                <div
                  key={item.id}
                  className={`swiggy-dish-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(item.id)}
                  id={`cuisine-${item.id}`}
                >
                  <div className="swiggy-dish-avatar">
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                    />
                  </div>
                  <span className="swiggy-dish-label">{item.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="swiggy-container">
        <hr className="swiggy-divider" />
      </div>

      {/* ===== SECTION 2: TOP RESTAURANT CHAINS IN CHENNAI ===== */}
      {!searchQuery && (
        <>
          <section className="swiggy-section" id="top-chains-section">
            <div className="swiggy-container">
              <div className="swiggy-section-header">
                <h2 className="swiggy-section-title">Top restaurant chains in Chennai</h2>
                <div className="swiggy-carousel-controls">
                  <button
                    className="swiggy-arrow-btn"
                    onClick={() => scrollCarousel(topChainsRef, 'left')}
                    aria-label="Scroll left"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    className="swiggy-arrow-btn"
                    onClick={() => scrollCarousel(topChainsRef, 'right')}
                    aria-label="Scroll right"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="swiggy-top-chains-row" ref={topChainsRef}>
                {restaurants.slice(0, 6).map(r => (
                  <div
                    key={r._id}
                    className="swiggy-restaurant-card carousel-card"
                    onClick={() => navigate(`/restaurant/${r._id}`)}
                  >
                    <div className="swiggy-card-img-wrapper">
                      <img src={r.image_url} alt={r.name} loading="lazy" />
                      <div className="swiggy-card-gradient-overlay">
                        <span className="swiggy-card-offer-badge">
                          {r.offer || 'ITEMS AT ₹149'}
                        </span>
                      </div>
                      <button
                        className={`swiggy-heart-btn ${favorites.has(r._id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(r._id)
                        }}
                      >
                        <FiHeart />
                      </button>
                    </div>

                    <div className="swiggy-card-content">
                      <h3 className="swiggy-card-title">{r.name}</h3>
                      <div className="swiggy-card-rating-line">
                        <span className="swiggy-star-badge">
                          ★ {r.rating}
                        </span>
                        <span className="swiggy-dot">•</span>
                        <span className="swiggy-time-text">{r.delivery_time} mins</span>
                      </div>
                      <p className="swiggy-card-cuisines">{r.cuisines.join(', ')}</p>
                      <p className="swiggy-card-locality">{r.address.split(',')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="swiggy-container">
            <hr className="swiggy-divider" />
          </div>
        </>
      )}

      {/* ===== SECTION 3: RESTAURANTS WITH ONLINE FOOD DELIVERY IN CHENNAI ===== */}
      <section className="swiggy-section" id="restaurants-section">
        <div className="swiggy-container">
          <div className="swiggy-section-header" style={{ marginBottom: '16px' }}>
            <h2 className="swiggy-section-title">
              {searchQuery
                ? `Showing food results for "${searchQuery}"`
                : 'Restaurants with online food delivery in Chennai'}
            </h2>
            <span className="swiggy-count-badge">
              {displayedRestaurants.length} restaurants
            </span>
          </div>

          {/* Swiggy Filter Pills Bar */}
          <div className="swiggy-filters-bar">
            {SWIGGY_FILTER_PILLS.map(pill => {
              const isSelected = activeFilter === pill.id
              return (
                <button
                  key={pill.id}
                  className={`swiggy-filter-pill ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveFilter(pill.id)}
                >
                  <span>{pill.label}</span>
                  {isSelected && <FiCheck className="swiggy-pill-check" />}
                </button>
              )
            })}

            {(activeCategory !== 'all' || activeFilter !== 'relevance' || searchQuery) && (
              <button
                className="swiggy-clear-filters-btn"
                onClick={handleClearAllFilters}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Restaurant Grid */}
          {loading ? (
            <div className="swiggy-restaurants-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="swiggy-skeleton-card">
                  <div className="swiggy-skeleton-img" />
                  <div className="swiggy-skeleton-line short" />
                  <div className="swiggy-skeleton-line" />
                  <div className="swiggy-skeleton-line half" />
                </div>
              ))}
            </div>
          ) : displayedRestaurants.length === 0 ? (
            <div className="swiggy-empty-state">
              <div className="swiggy-empty-icon">🍽️</div>
              <h3>No restaurants found</h3>
              <p>We couldn't find any results matching your filters. Try clearing filters or search for something else.</p>
              <button
                className="swiggy-orange-btn"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="swiggy-restaurants-grid">
              {displayedRestaurants.map(r => (
                <div
                  key={r._id}
                  className="swiggy-restaurant-card"
                  onClick={() => navigate(`/restaurant/${r._id}`)}
                  id={`restaurant-${r._id}`}
                >
                  <div className="swiggy-card-img-wrapper">
                    <img
                      src={r.image_url}
                      alt={r.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'
                      }}
                    />
                    <div className="swiggy-card-gradient-overlay">
                      <span className="swiggy-card-offer-badge">
                        {r.offer || 'ITEMS AT ₹149'}
                      </span>
                    </div>
                    <button
                      className={`swiggy-heart-btn ${favorites.has(r._id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(r._id)
                      }}
                      title="Favorite"
                    >
                      <FiHeart />
                    </button>
                  </div>

                  <div className="swiggy-card-content">
                    <h3 className="swiggy-card-title">{r.name}</h3>
                    <div className="swiggy-card-rating-line">
                      <span className="swiggy-star-badge">
                        ★ {r.rating}
                      </span>
                      <span className="swiggy-dot">•</span>
                      <span className="swiggy-time-text">{r.delivery_time} mins</span>
                    </div>
                    <p className="swiggy-card-cuisines">
                      {r.cuisines.join(', ')}
                    </p>
                    <p className="swiggy-card-locality">
                      {r.address.split(',')[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
