import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiClock, FiMapPin, FiPhone, FiRefreshCw,
  FiShoppingBag, FiTruck, FiAlertCircle, FiArrowLeft, FiDollarSign
} from 'react-icons/fi'
import { MdRestaurant, MdDeliveryDining } from 'react-icons/md'
import axios from 'axios'

const RESTAURANTS = [
  { id: 'rest_001', name: 'Dindigul Thalappakatti', area: 'T. Nagar, Chennai' },
  { id: 'rest_002', name: 'Tuscana Pizza & Italian Trattoria', area: 'Nungambakkam, Chennai' },
  { id: 'rest_003', name: "Sandy's Chocolate Laboratory", area: 'Alwarpet, Chennai' },
  { id: 'rest_004', name: 'Mainland China & Dragon Wok', area: 'Velachery, Chennai' },
  { id: 'rest_005', name: 'Murugan Idli Shop', area: 'T. Nagar, Chennai' },
  { id: 'rest_006', name: 'Anjappar Chettinad Restaurant', area: 'Anna Nagar, Chennai' },
  { id: 'rest_007', name: "Writer's Cafe", area: 'Gopalapuram, Chennai' },
  { id: 'rest_008', name: 'Madras Coffee House & Beach Bites', area: 'Besant Nagar, Chennai' },
]

export default function PartnerDashboard({ addToast }) {
  const [selectedRestId, setSelectedRestId] = useState('rest_001')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true)
  const [activeTab, setActiveTab] = useState('active') // 'active', 'delivered'
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRestaurantOrders()
    // Poll every 5 seconds for new incoming orders
    const timer = setInterval(() => {
      fetchRestaurantOrders(false)
    }, 5000)
    return () => clearInterval(timer)
  }, [selectedRestId])

  const fetchRestaurantOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const res = await axios.get('/api/orders', {
        params: { restaurant_id: selectedRestId }
      })
      setOrders(res.data || [])
    } catch (err) {
      console.error('Failed to fetch restaurant orders:', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus })
      if (addToast) {
        addToast(`Order #${orderId.slice(-6)} updated to ${newStatus.replace(/_/g, ' ')}!`, 'success')
      }
      // Update local state immediately
      setOrders(prev => prev.map(o => (o._id === orderId || o.order_id === orderId) ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error('Status update failed:', err)
      if (addToast) addToast('Failed to update order status', 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const selectedRest = RESTAURANTS.find(r => r.id === selectedRestId) || RESTAURANTS[0]

  // Filter orders by active vs completed
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.total_amount || 0), 0)

  return (
    <div className="partner-portal" style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Partner Header */}
      <header style={{
        background: '#ffffff', borderBottom: '1px solid #e2e2e7',
        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div className="swiggy-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Logo & Portal title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <svg viewBox="0 0 500 500" width="36" height="36" fill="none">
                <rect width="500" height="500" rx="120" fill="#FC8019" />
                <path d="M250 85C170 85 105 150 105 230C105 295 185 390 242 452C246.5 456.8 253.5 456.8 258 452C315 390 395 295 395 230C395 150 330 85 250 85ZM250 165C286 165 315 194 315 230C315 266 286 295 250 295C214 295 185 266 185 230C185 194 214 165 250 165Z" fill="white" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fc8019', letterSpacing: '-0.3px', lineHeight: 1 }}>
                  SWIGGY PARTNER
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7e808c', textTransform: 'uppercase' }}>
                  Merchant Kitchen Portal
                </span>
              </div>
            </div>

            {/* Restaurant Selector */}
            <div style={{ borderLeft: '1px solid #e2e2e7', paddingLeft: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#7e808c', display: 'block', textTransform: 'uppercase' }}>
                Managing Outlet
              </label>
              <select
                value={selectedRestId}
                onChange={(e) => setSelectedRestId(e.target.value)}
                style={{
                  background: '#ffffff', border: '1px solid #fc8019',
                  borderRadius: '8px', padding: '6px 12px', fontSize: '14px',
                  fontWeight: 700, color: '#02060c', outline: 'none', cursor: 'pointer'
                }}
              >
                {RESTAURANTS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.area.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Status toggle */}
            <button
              onClick={() => setIsAcceptingOrders(prev => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '50px',
                background: isAcceptingOrders ? '#e7f7ed' : '#fff0f0',
                color: isAcceptingOrders ? '#117a37' : '#e43b4f',
                fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer'
              }}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isAcceptingOrders ? '#117a37' : '#e43b4f'
              }} />
              {isAcceptingOrders ? 'Accepting Orders' : 'Outlet Offline'}
            </button>

            {/* Switch back to Customer App */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px',
                background: '#02060c', color: '#ffffff',
                fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer'
              }}
            >
              <FiArrowLeft /> Switch to Customer App
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="swiggy-container" style={{ marginTop: '24px' }}>
        {/* Metric Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px', marginBottom: '24px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e2e7', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7e808c', textTransform: 'uppercase' }}>Active Incoming Orders</span>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fc8019', marginTop: '4px' }}>{activeOrders.length}</h2>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e2e7', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7e808c', textTransform: 'uppercase' }}>Delivered Today</span>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#117a37', marginTop: '4px' }}>{deliveredOrders.length}</h2>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e2e7', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7e808c', textTransform: 'uppercase' }}>Total Revenue</span>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#02060c', marginTop: '4px' }}>₹{totalRevenue}</h2>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e2e7', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7e808c', textTransform: 'uppercase' }}>Assigned Driver</span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#02060c', marginTop: '4px' }}>Murugan Selvam</h3>
            <span style={{ fontSize: '12px', color: '#7e808c' }}>Ather 450X EV • 4.88 ★</span>
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{
                padding: '10px 20px', borderRadius: '12px',
                background: activeTab === 'active' ? '#fc8019' : '#ffffff',
                color: activeTab === 'active' ? '#ffffff' : '#02060c',
                fontWeight: 800, fontSize: '14px', border: '1px solid',
                borderColor: activeTab === 'active' ? '#fc8019' : '#e2e2e7',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              Live Kitchen Orders ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              style={{
                padding: '10px 20px', borderRadius: '12px',
                background: activeTab === 'delivered' ? '#fc8019' : '#ffffff',
                color: activeTab === 'delivered' ? '#ffffff' : '#02060c',
                fontWeight: 800, fontSize: '14px', border: '1px solid',
                borderColor: activeTab === 'delivered' ? '#fc8019' : '#e2e2e7',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              Delivered History ({deliveredOrders.length})
            </button>
          </div>

          <button
            onClick={() => fetchRestaurantOrders(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: '#ffffff', border: '1px solid #e2e2e7',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh Orders
          </button>
        </div>

        {/* Order Cards List */}
        {loading && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Loading incoming orders for {selectedRest.name}...</p>
          </div>
        ) : (activeTab === 'active' ? activeOrders : deliveredOrders).length === 0 ? (
          <div style={{
            background: '#ffffff', borderRadius: '20px',
            padding: '60px 20px', textAlign: 'center',
            border: '1px solid #e2e2e7'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛎️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#02060c', marginBottom: '8px' }}>
              No {activeTab === 'active' ? 'Active' : 'Delivered'} Orders Right Now
            </h3>
            <p style={{ color: '#7e808c', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
              {activeTab === 'active'
                ? `When a customer orders from ${selectedRest.name} in the Swiggy customer app, it will appear here immediately!`
                : 'No past orders have been completed yet.'}
            </p>
            {activeTab === 'active' && (
              <button
                className="swiggy-orange-btn"
                onClick={() => navigate(`/restaurant/${selectedRestId}`)}
              >
                Go Order from this Restaurant as Customer
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {(activeTab === 'active' ? activeOrders : deliveredOrders).map(order => {
              const status = order.status || 'placed'
              const isUpdating = updatingOrderId === (order._id || order.order_id)
              return (
                <div
                  key={order._id || order.order_id}
                  style={{
                    background: '#ffffff', borderRadius: '20px',
                    border: '1px solid #e2e2e7', padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    display: 'flex', flexDirection: 'column'
                  }}
                >
                  {/* Order Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#7e808c' }}>
                        ORDER #{String(order._id || order.order_id).slice(-6).toUpperCase()}
                      </span>
                      <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#02060c', marginTop: '2px' }}>
                        {order.user_name || 'Customer'}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#7e808c', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <FiClock size={12} /> {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '4px 12px', borderRadius: '50px',
                      fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
                      background: status === 'placed' ? '#fff2e5' : status === 'confirmed' ? '#e3f2fd' : status === 'preparing' ? '#fff8e1' : status === 'out_for_delivery' ? '#e8f5e9' : '#e7f7ed',
                      color: status === 'placed' ? '#fc8019' : status === 'confirmed' ? '#1976d2' : status === 'preparing' ? '#f57f17' : status === 'out_for_delivery' ? '#2e7d32' : '#117a37'
                    }}>
                      {status === 'placed' ? '🔔 New Order' : status === 'confirmed' ? 'Accepted' : status === 'preparing' ? 'In Kitchen' : status === 'out_for_delivery' ? 'On The Way' : 'Delivered'}
                    </span>
                  </div>

                  {/* Delivery Address */}
                  <div style={{ background: '#f9f9fb', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#02060c' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <FiMapPin style={{ color: '#fc8019' }} />
                      <strong style={{ whiteSpace: 'nowrap' }}>Deliver to:</strong>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.delivery_address}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ flex: 1, borderTop: '1px dashed #e2e2e7', paddingTop: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#7e808c', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      Items Ordered ({order.items?.length || 0})
                    </span>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#02060c' }}>
                          <strong style={{ color: '#fc8019', marginRight: '6px' }}>{item.quantity}x</strong>
                          {item.name}
                        </span>
                        <span style={{ fontWeight: 700, color: '#02060c' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e2e7', paddingTop: '10px', marginTop: '10px', fontSize: '15px', fontWeight: 900 }}>
                      <span>Bill Total:</span>
                      <span style={{ color: '#fc8019' }}>₹{order.total || order.total_amount}</span>
                    </div>
                  </div>

                  {/* Action Buttons depending on status */}
                  <div style={{ borderTop: '1px solid #e2e2e7', paddingTop: '16px' }}>
                    {status === 'placed' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id || order.order_id, 'confirmed')}
                        disabled={isUpdating}
                        style={{
                          width: '100%', height: '44px',
                          background: '#117a37', color: '#ffffff',
                          borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                          border: 'none', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <FiCheckCircle size={18} />
                        {isUpdating ? 'Updating...' : 'ACCEPT & CONFIRM ORDER'}
                      </button>
                    )}

                    {status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id || order.order_id, 'preparing')}
                        disabled={isUpdating}
                        style={{
                          width: '100%', height: '44px',
                          background: '#fc8019', color: '#ffffff',
                          borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                          border: 'none', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <MdRestaurant size={18} />
                        {isUpdating ? 'Updating...' : 'START COOKING IN KITCHEN'}
                      </button>
                    )}

                    {status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id || order.order_id, 'out_for_delivery')}
                        disabled={isUpdating}
                        style={{
                          width: '100%', height: '44px',
                          background: '#2563eb', color: '#ffffff',
                          borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                          border: 'none', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <FiTruck size={18} />
                        {isUpdating ? 'Updating...' : 'HANDOVER TO RIDER (OUT FOR DELIVERY)'}
                      </button>
                    )}

                    {status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id || order.order_id, 'delivered')}
                        disabled={isUpdating}
                        style={{
                          width: '100%', height: '44px',
                          background: '#117a37', color: '#ffffff',
                          borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                          border: 'none', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <FiCheckCircle size={18} />
                        {isUpdating ? 'Updating...' : 'CONFIRM ORDER DELIVERED'}
                      </button>
                    )}

                    {status === 'delivered' && (
                      <div style={{ textAlign: 'center', color: '#117a37', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <FiCheckCircle /> Order Completed & Delivered
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
