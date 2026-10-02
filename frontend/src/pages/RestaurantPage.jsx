import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiStar, FiClock, FiMapPin, FiArrowLeft, FiSearch, FiX, FiPlus, FiMinus } from 'react-icons/fi'
import axios from 'axios'

export default function RestaurantPage({ addToCart, cart = [], onUpdateQuantity }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtering states
  const [dietFilter, setDietFilter] = useState('all') // 'all', 'veg', 'non_veg'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dishSearch, setDishSearch] = useState('')

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

  // Calculate unique categories present in menu
  const menuCategories = useMemo(() => {
    const cats = new Set()
    menuItems.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return ['all', 'bestsellers', ...Array.from(cats)]
  }, [menuItems])

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Diet filter
      if (dietFilter === 'veg' && !item.is_veg) return false
      if (dietFilter === 'non_veg' && item.is_veg) return false

      // Category filter
      if (categoryFilter === 'bestsellers' && !item.is_bestseller) return false
      if (categoryFilter !== 'all' && categoryFilter !== 'bestsellers' && item.category !== categoryFilter) {
        return false
      }

      // Dish search
      if (dishSearch.trim()) {
        const query = dishSearch.trim().toLowerCase()
        const nameMatch = item.name.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        if (!nameMatch && !descMatch) return false
      }

      return true
    })
  }, [menuItems, dietFilter, categoryFilter, dishSearch])

  // Helper to get cart quantity for an item
  const getItemCartQty = (itemId) => {
    const found = cart.find(i => i._id === itemId)
    return found ? found.quantity : 0
  }

  if (!restaurant && !loading) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Restaurant not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The restaurant you are looking for might have closed or doesn't exist.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    )
  }

  return (
    <div id="restaurant-detail-page" style={{ paddingBottom: '80px' }}>
      {/* Banner */}
      <div className="restaurant-detail-banner">
        {restaurant ? (
          <img src={restaurant.image_url} alt={restaurant.name} />
        ) : (
          <div className="skeleton" style={{ height: '100%' }} />
        )}
        <div className="restaurant-detail-banner-overlay">
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'white', fontSize: '14px', fontWeight: 600,
              marginBottom: '12px', background: 'rgba(0, 0, 0, 0.4)',
              padding: '8px 16px', borderRadius: '10px', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer'
            }}
          >
            <FiArrowLeft /> Back to restaurants
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="container">
        {restaurant ? (
          <div className="restaurant-detail-info">
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--fs-2xl)',
                fontWeight: 800,
                marginBottom: '4px'
              }}>
                {restaurant.name}
              </h1>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
                {restaurant.cuisines?.join(', ')}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiMapPin size={14} /> {restaurant.address}
              </p>
              {restaurant.offer && (
                <div style={{
                  display: 'inline-block', marginTop: '10px',
                  background: 'var(--brand-gradient-subtle)', color: 'var(--brand-primary)',
                  padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700
                }}>
                  🏷️ {restaurant.offer}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="restaurant-card-rating" style={{ fontSize: 'var(--fs-base)', padding: '8px 14px' }}>
                <FiStar /> {restaurant.rating}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)'
                }}>
                  <FiClock size={14} /> {restaurant.delivery_time} min
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)'
                }}>
                  ₹{restaurant.price_for_two} for two
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="restaurant-detail-info">
            <div>
              <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: 300 }} />
            </div>
          </div>
        )}

        {/* Menu Controls Section */}
        <div className="section" style={{ marginTop: '32px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '16px', marginBottom: '24px'
          }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '4px' }}>Recommended Dishes</h2>
              <p className="section-subtitle" style={{ margin: 0 }}>
                {filteredMenuItems.length} dishes available
              </p>
            </div>

            {/* Menu Search Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)',
              padding: '8px 14px', borderRadius: '12px', minWidth: '260px'
            }}>
              <FiSearch color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search dishes in menu..."
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '0.85rem', width: '100%'
                }}
              />
              {dishSearch && (
                <button
                  onClick={() => setDishSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills (Diet & Categories) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
            {/* Diet Filter Pills */}
            <div style={{ display: 'flex', background: 'var(--neutral-100)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
              <button
                onClick={() => setDietFilter('all')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: dietFilter === 'all' ? 'var(--bg-card)' : 'transparent',
                  fontWeight: dietFilter === 'all' ? 700 : 500, fontSize: '0.85rem',
                  boxShadow: dietFilter === 'all' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer', color: 'var(--text-primary)'
                }}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: dietFilter === 'veg' ? '#10b981' : 'transparent',
                  color: dietFilter === 'veg' ? 'white' : 'var(--text-primary)',
                  fontWeight: dietFilter === 'veg' ? 700 : 500, fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Pure Veg 🌱
              </button>
              <button
                onClick={() => setDietFilter('non_veg')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: dietFilter === 'non_veg' ? '#ef4444' : 'transparent',
                  color: dietFilter === 'non_veg' ? 'white' : 'var(--text-primary)',
                  fontWeight: dietFilter === 'non_veg' ? 700 : 500, fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Non-Veg 🍗
              </button>
            </div>

            <div style={{ height: '24px', width: '1px', background: 'var(--border-medium)', margin: '0 4px' }} />

            {/* Category Pills */}
            {menuCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '6px 16px', borderRadius: '20px',
                  border: categoryFilter === cat ? '1px solid var(--brand-primary)' : '1px solid var(--border-medium)',
                  background: categoryFilter === cat ? 'var(--brand-primary)' : 'var(--bg-card)',
                  color: categoryFilter === cat ? 'white' : 'var(--text-secondary)',
                  fontWeight: categoryFilter === cat ? 700 : 500, fontSize: '0.85rem',
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat === 'bestsellers' ? '⭐ Bestsellers' : cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Dishes Count Indicator */}
          {!loading && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              <span>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredMenuItems.length}</strong> {filteredMenuItems.length === 1 ? 'dish' : 'dishes'}
              </span>
              {(dietFilter !== 'all' || categoryFilter !== 'all' || dishSearch) && (
                <button
                  onClick={() => { setDietFilter('all'); setCategoryFilter('all'); setDishSearch('') }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--brand-primary)',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Menu Items Grid */}
          {loading ? (
            <div className="menu-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="food-card">
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 16, width: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '80%' }} />
                  </div>
                  <div className="skeleton" style={{ width: 130, height: 100, borderRadius: 12, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', borderRadius: '20px',
              border: 'var(--border-light)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍲</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                No dishes matched your criteria
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Try switching between Pure Veg / Non-Veg or clearing search filters.
              </p>
              <button
                onClick={() => { setDietFilter('all'); setCategoryFilter('all'); setDishSearch('') }}
                style={{
                  padding: '8px 20px', borderRadius: '10px',
                  background: 'var(--brand-primary)', color: 'white',
                  border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Reset Menu Filters
              </button>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredMenuItems.map(item => {
                const qty = getItemCartQty(item._id)
                return (
                  <div key={item._id} className="food-card" id={`menu-item-${item._id}`}>
                    <div className="food-card-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div className={`food-card-veg ${item.is_veg ? '' : 'non-veg'}`} title={item.is_veg ? 'Pure Veg' : 'Non-Veg'} />
                        {item.is_bestseller && (
                          <span style={{
                            background: '#FFF3E0', color: '#E65100',
                            fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px',
                            borderRadius: '4px', textTransform: 'uppercase'
                          }}>
                            ★ Bestseller
                          </span>
                        )}
                        <span style={{
                          color: 'var(--text-tertiary)', fontSize: '0.75rem',
                          textTransform: 'capitalize', marginLeft: 'auto'
                        }}>
                          {item.category?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="food-card-name">{item.name}</h3>
                      <p className="food-card-price">₹{item.price}</p>
                      <p className="food-card-desc">{item.description}</p>
                    </div>
                    <div className="food-card-image">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'
                        }}
                      />
                      {qty > 0 && onUpdateQuantity ? (
                        <div style={{
                          position: 'absolute', bottom: '0px', left: '50%',
                          transform: 'translateX(-50%)', display: 'flex',
                          alignItems: 'center', gap: '6px', background: 'white',
                          borderRadius: '8px', padding: '3px 8px',
                          boxShadow: 'var(--shadow-md)', border: '1.5px solid var(--brand-primary)',
                          zIndex: 2
                        }}>
                          <button
                            onClick={() => onUpdateQuantity(item._id, -1)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--brand-primary)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px'
                            }}
                          >
                            <FiMinus size={12} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-primary)', minWidth: '16px', textAlign: 'center' }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item._id, 1)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--brand-primary)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px'
                            }}
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="food-card-add-btn"
                          onClick={() => addToCart({ ...item, restaurant_id: id })}
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
