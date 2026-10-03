import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiStar, FiClock, FiMapPin, FiArrowLeft, FiSearch, FiX,
  FiPlus, FiMinus, FiChevronDown, FiChevronUp, FiTag
} from 'react-icons/fi'
import { MdDeliveryDining } from 'react-icons/md'
import axios from 'axios'

export default function RestaurantPage({ addToCart, cart = [], onUpdateQuantity }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtering states
  const [dietFilter, setDietFilter] = useState('all') // 'all', 'veg', 'non_veg'
  const [bestsellerOnly, setBestsellerOnly] = useState(false)
  const [dishSearch, setDishSearch] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState({})

  useEffect(() => {
    fetchRestaurant()
    fetchMenu()
  }, [id])

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(`/api/restaurants/${id}`)
      setRestaurant(res.data)
    } catch (err) {
      console.error('Failed to fetch restaurant:', err)
    }
  }

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/restaurants/${id}/menu`)
      setMenuItems(res.data || [])
    } catch (err) {
      console.error('Failed to fetch menu:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Diet filter
      if (dietFilter === 'veg' && !item.is_veg) return false
      if (dietFilter === 'non_veg' && item.is_veg) return false

      // Bestseller filter
      if (bestsellerOnly && !item.is_bestseller) return false

      // Dish search
      if (dishSearch.trim()) {
        const query = dishSearch.trim().toLowerCase()
        const nameMatch = item.name.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        if (!nameMatch && !descMatch) return false
      }

      return true
    })
  }, [menuItems, dietFilter, bestsellerOnly, dishSearch])

  // Group items by category (Swiggy accordion structure)
  const categorizedMenu = useMemo(() => {
    const groups = {}
    filteredMenuItems.forEach(item => {
      const cat = item.category || 'recommended'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return groups
  }, [filteredMenuItems])

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }))
  }

  // Helper to get cart quantity for an item
  const getItemCartQty = (itemId) => {
    const found = cart.find(i => i._id === itemId)
    return found ? found.quantity : 0
  }

  if (!restaurant && !loading) {
    return (
      <div className="swiggy-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', fontWeight: 800 }}>Restaurant not found</h2>
        <p style={{ color: '#7e808c', marginBottom: '24px' }}>
          The restaurant you are looking for might have closed or does not exist.
        </p>
        <button className="swiggy-orange-btn" onClick={() => navigate('/')}>
          See all restaurants
        </button>
      </div>
    )
  }

  return (
    <div className="swiggy-restaurant-page" id="restaurant-detail-page">
      <div className="swiggy-container">
        {/* Breadcrumb Navigation */}
        <nav className="swiggy-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span className="sep">/</span>
          <span onClick={() => navigate('/')}>Chennai</span>
          <span className="sep">/</span>
          <span onClick={() => navigate('/')}>{restaurant?.address?.split(',')[0] || 'T. Nagar'}</span>
          <span className="sep">/</span>
          <span className="active">{restaurant?.name || 'Restaurant'}</span>
        </nav>

        {/* Swiggy Restaurant Hero Card */}
        {restaurant ? (
          <div className="swiggy-menu-header-card">
            <div className="swiggy-menu-header-top">
              <div>
                <h1 className="swiggy-menu-restaurant-name">{restaurant.name}</h1>
                <p className="swiggy-menu-cuisines">{restaurant.cuisines?.join(', ')}</p>
                <p className="swiggy-menu-locality">
                  <FiMapPin size={13} style={{ marginRight: '4px', color: '#fc8019' }} />
                  {restaurant.address}
                </p>
              </div>

              <div className="swiggy-menu-rating-box">
                <div className="swiggy-menu-rating-badge">
                  <FiStar /> {restaurant.rating}
                </div>
                <span className="swiggy-menu-rating-count">1K+ ratings</span>
                <span className="swiggy-menu-price-two">₹{restaurant.price_for_two} for two</span>
              </div>
            </div>

            <hr className="swiggy-card-divider" />

            <div className="swiggy-menu-delivery-meta">
              <div className="swiggy-meta-item">
                <FiClock className="swiggy-meta-icon" />
                <span>{restaurant.delivery_time} MINS</span>
              </div>
              <div className="swiggy-meta-dot">•</div>
              <div className="swiggy-meta-item">
                <MdDeliveryDining className="swiggy-meta-icon" size={18} />
                <span>{restaurant.distance} km</span>
              </div>
            </div>

            {/* Swiggy Deals For You */}
            <div className="swiggy-deals-row">
              <div className="swiggy-deal-card">
                <FiTag className="swiggy-deal-icon" />
                <div className="swiggy-deal-info">
                  <strong>{restaurant.offer || '60% OFF UPTO ₹120'}</strong>
                  <span>USE CODE SWIGGY60 | ABOVE ₹199</span>
                </div>
              </div>
              <div className="swiggy-deal-card">
                <FiTag className="swiggy-deal-icon" />
                <div className="swiggy-deal-info">
                  <strong>FLAT ₹150 OFF</strong>
                  <span>USE CODE FLAT150 | ON ₹499+</span>
                </div>
              </div>
              <div className="swiggy-deal-card">
                <FiTag className="swiggy-deal-icon" />
                <div className="swiggy-deal-info">
                  <strong>FREE DELIVERY</strong>
                  <span>ON YOUR FIRST 3 ORDERS</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="swiggy-menu-header-card skeleton-box">
            <div className="swiggy-skeleton-line" style={{ width: '40%', height: 28, marginBottom: 12 }} />
            <div className="swiggy-skeleton-line" style={{ width: '25%', height: 16 }} />
          </div>
        )}

        {/* Menu Search and Filter Controls */}
        <div className="swiggy-menu-controls-bar">
          <div className="swiggy-menu-filters-left">
            <button
              className={`swiggy-toggle-btn veg ${dietFilter === 'veg' ? 'active' : ''}`}
              onClick={() => setDietFilter(prev => prev === 'veg' ? 'all' : 'veg')}
            >
              <div className="swiggy-veg-icon" />
              <span>Veg Only</span>
            </button>

            <button
              className={`swiggy-toggle-btn non-veg ${dietFilter === 'non_veg' ? 'active' : ''}`}
              onClick={() => setDietFilter(prev => prev === 'non_veg' ? 'all' : 'non_veg')}
            >
              <div className="swiggy-nonveg-icon" />
              <span>Non-Veg</span>
            </button>

            <button
              className={`swiggy-toggle-btn ${bestsellerOnly ? 'active' : ''}`}
              onClick={() => setBestsellerOnly(prev => !prev)}
            >
              <span>⭐ Bestseller</span>
            </button>
          </div>

          {/* Dish Search in Menu */}
          <div className="swiggy-menu-search">
            <FiSearch className="swiggy-menu-search-icon" />
            <input
              type="text"
              placeholder="Search in menu..."
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
            />
            {dishSearch && (
              <button onClick={() => setDishSearch('')} className="swiggy-clear-icon">
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Dishes Sections / Accordions */}
        <div className="swiggy-menu-sections">
          {loading ? (
            <div className="swiggy-menu-skeleton-list">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="swiggy-dish-row skeleton-row">
                  <div style={{ flex: 1 }}>
                    <div className="swiggy-skeleton-line short" />
                    <div className="swiggy-skeleton-line" />
                    <div className="swiggy-skeleton-line half" />
                  </div>
                  <div className="swiggy-skeleton-img" style={{ width: 140, height: 120, borderRadius: 16 }} />
                </div>
              ))}
            </div>
          ) : Object.keys(categorizedMenu).length === 0 ? (
            <div className="swiggy-empty-state" style={{ padding: '60px 20px' }}>
              <div className="swiggy-empty-icon">🍲</div>
              <h3>No dishes found</h3>
              <p>No items matched your current filter criteria.</p>
              <button
                className="swiggy-orange-btn"
                onClick={() => {
                  setDietFilter('all')
                  setBestsellerOnly(false)
                  setDishSearch('')
                }}
              >
                Reset Menu Filters
              </button>
            </div>
          ) : (
            Object.entries(categorizedMenu).map(([category, items]) => {
              const isCollapsed = collapsedCategories[category]
              return (
                <div key={category} className="swiggy-category-accordion">
                  {/* Category Header */}
                  <div
                    className="swiggy-category-header"
                    onClick={() => toggleCategoryCollapse(category)}
                  >
                    <h2 className="swiggy-category-title">
                      {category.replace(/_/g, ' ')} ({items.length})
                    </h2>
                    {isCollapsed ? <FiChevronDown size={22} /> : <FiChevronUp size={22} />}
                  </div>

                  {/* Dishes inside this category */}
                  {!isCollapsed && (
                    <div className="swiggy-dishes-list">
                      {items.map(dish => {
                        const qty = getItemCartQty(dish._id)
                        return (
                          <div key={dish._id} className="swiggy-dish-row" id={`dish-${dish._id}`}>
                            {/* Left details */}
                            <div className="swiggy-dish-info">
                              <div className="swiggy-dish-badge-row">
                                <div
                                  className={dish.is_veg ? 'swiggy-veg-icon' : 'swiggy-nonveg-icon'}
                                  title={dish.is_veg ? 'Pure Veg' : 'Non-Veg'}
                                />
                                {dish.is_bestseller && (
                                  <span className="swiggy-bestseller-tag">
                                    ★ Bestseller
                                  </span>
                                )}
                              </div>

                              <h3 className="swiggy-dish-name">{dish.name}</h3>
                              <p className="swiggy-dish-price">₹{dish.price}</p>

                              <div className="swiggy-dish-rating">
                                <span className="swiggy-star-text">★ 4.3</span>
                                <span className="swiggy-rating-users">(42)</span>
                              </div>

                              <p className="swiggy-dish-desc">{dish.description}</p>
                            </div>

                            {/* Right Image + ADD Button */}
                            <div className="swiggy-dish-media">
                              <div className="swiggy-dish-img-wrap">
                                <img
                                  src={dish.image_url}
                                  alt={dish.name}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'
                                  }}
                                />
                                {/* Signature Swiggy Overlapping ADD button */}
                                {qty === 0 ? (
                                  <button
                                    className="swiggy-add-btn"
                                    onClick={() => addToCart({ ...dish, restaurant_id: restaurant._id })}
                                    id={`add-btn-${dish._id}`}
                                  >
                                    <span>ADD</span>
                                    <FiPlus size={14} className="swiggy-add-plus" />
                                  </button>
                                ) : (
                                  <div className="swiggy-qty-counter">
                                    <button
                                      onClick={() => onUpdateQuantity(dish._id, -1)}
                                      aria-label="Decrease quantity"
                                    >
                                      <FiMinus size={14} />
                                    </button>
                                    <span className="swiggy-qty-num">{qty}</span>
                                    <button
                                      onClick={() => onUpdateQuantity(dish._id, 1)}
                                      aria-label="Increase quantity"
                                    >
                                      <FiPlus size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className="swiggy-customisable-text">customisable</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
