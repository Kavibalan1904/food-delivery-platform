import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiPlus, FiMinus, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import { MdDeliveryDining } from 'react-icons/md'
import axios from 'axios'

export default function CartSidebar({ isOpen, onClose, items, onUpdateQuantity, total, addToast, clearCart, user }) {
  const [address, setAddress] = useState('24, Khader Nawaz Khan Road, Nungambakkam, Chennai')
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (items.length === 0) return
    setIsOrdering(true)
    try {
      const restaurantId = items[0]?.restaurant_id || 'rest_001'
      const payload = {
        restaurant_id: restaurantId,
        items: items.map(i => ({
          item_id: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        delivery_address: address,
        payment_method: 'online'
      }

      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post('/api/orders', payload, { headers })

      const orderId = res.data.order_id
      setOrderSuccess(orderId)
      addToast(`Order placed successfully! ID: #${orderId.slice(-6)} 🎉`, 'success')
      if (clearCart) clearCart()
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.detail || 'Failed to place order. Please try again.', 'error')
    } finally {
      setIsOrdering(false)
    }
  }

  const handleClose = () => {
    setOrderSuccess(null)
    onClose()
  }

  const handleTrackOrder = () => {
    const id = orderSuccess
    handleClose()
    navigate(`/order/${id}`)
  }

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
        id="cart-overlay"
      />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`} id="cart-sidebar">
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <button className="cart-close" onClick={handleClose} id="cart-close-btn">
            <FiX />
          </button>
        </div>

        {orderSuccess ? (
          <div className="cart-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#10b981', marginBottom: '16px' }}>
              <FiCheckCircle style={{ display: 'inline-block' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Order Confirmed!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Order ID: <strong style={{ color: 'var(--text-primary)' }}>#{orderSuccess.slice(-8)}</strong>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Your meal will be delivered to <strong>{address}</strong> in ~30 mins.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="cart-checkout-btn"
                onClick={handleTrackOrder}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <MdDeliveryDining size={20} /> Track Live Order
              </button>
              <button
                onClick={handleClose}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'var(--neutral-100)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛒</div>
                  <p className="cart-empty-text">Your cart is empty</p>
                  <p className="cart-empty-subtext">Add items from a restaurant to get started</p>
                </div>
              ) : (
                items.map(item => (
                  <div className="cart-item" key={item._id}>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price * item.quantity}</div>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="cart-item-btn"
                        onClick={() => onUpdateQuantity(item._id, -1)}
                      >
                        <FiMinus />
                      </button>
                      <span className="cart-item-qty">{item.quantity}</span>
                      <button
                        className="cart-item-btn"
                        onClick={() => onUpdateQuantity(item._id, 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <FiMapPin /> Delivery Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div className="cart-total">
                  <span className="cart-total-label">Total</span>
                  <span className="cart-total-value">₹{total.toFixed(0)}</span>
                </div>
                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  disabled={isOrdering}
                  id="checkout-btn"
                >
                  {isOrdering ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
