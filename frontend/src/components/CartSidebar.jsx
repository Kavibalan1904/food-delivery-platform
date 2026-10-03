import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiPlus, FiMinus, FiMapPin, FiCheckCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { MdDeliveryDining } from 'react-icons/md'
import axios from 'axios'

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  total,
  addToast,
  clearCart,
  user
}) {
  const [address, setAddress] = useState('24, Khader Nawaz Khan Road, Nungambakkam, Chennai')
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const navigate = useNavigate()

  const deliveryFee = total > 199 ? 0 : 35
  const platformFee = items.length > 0 ? 5 : 0
  const gstCharges = items.length > 0 ? Math.round(total * 0.05) : 0
  const finalPayTotal = total + deliveryFee + platformFee + gstCharges

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
        className={`swiggy-cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
        id="cart-overlay"
      />

      <div className={`swiggy-cart-drawer ${isOpen ? 'open' : ''}`} id="cart-sidebar">
        {/* Cart Drawer Header */}
        <div className="swiggy-cart-drawer-header">
          <div className="swiggy-cart-title-row">
            <FiShoppingBag size={20} style={{ color: '#fc8019' }} />
            <h2 className="swiggy-cart-drawer-title">Cart</h2>
            <span className="swiggy-cart-items-count">({items.length} items)</span>
          </div>
          <button className="swiggy-cart-close-btn" onClick={handleClose} id="cart-close-btn">
            <FiX size={20} />
          </button>
        </div>

        {orderSuccess ? (
          <div className="swiggy-cart-success-view">
            <div className="swiggy-success-icon-wrap">
              <FiCheckCircle size={48} />
            </div>
            <h3>Order Placed!</h3>
            <p className="swiggy-success-order-id">
              Order ID: <strong>#{orderSuccess.slice(-8)}</strong>
            </p>
            <p className="swiggy-success-sub">
              Your meal will be delivered to <strong>{address}</strong> in ~30 mins.
            </p>
            <button
              className="swiggy-orange-btn track-btn"
              onClick={handleTrackOrder}
            >
              <MdDeliveryDining size={20} />
              <span>Track Live Order</span>
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="swiggy-cart-empty-view">
            <img
              src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_yfxml0"
              alt="Empty Cart"
              className="swiggy-empty-cart-img"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop'
              }}
            />
            <h3>Your cart is empty</h3>
            <p>You can go to home page to view more restaurants</p>
            <button
              className="swiggy-orange-btn"
              onClick={handleClose}
            >
              SEE RESTAURANTS NEAR YOU
            </button>
          </div>
        ) : (
          <div className="swiggy-cart-body">
            {/* Restaurant header badge in cart */}
            <div className="swiggy-cart-restaurant-banner">
              <div className="swiggy-cart-rest-icon">🍲</div>
              <div>
                <h4>Items from your restaurant</h4>
                <p>Singara Chennai Delivery</p>
              </div>
            </div>

            {/* Itemized List */}
            <div className="swiggy-cart-items-list">
              {items.map(item => (
                <div key={item._id} className="swiggy-cart-item-row">
                  <div className="swiggy-cart-item-details">
                    <div className={item.is_veg ? 'swiggy-veg-icon' : 'swiggy-nonveg-icon'} />
                    <span className="swiggy-cart-item-name">{item.name}</span>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="swiggy-cart-qty-counter">
                    <button
                      onClick={() => onUpdateQuantity(item._id, -1)}
                      className="swiggy-cart-qty-btn"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="swiggy-cart-qty-val">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item._id, 1)}
                      className="swiggy-cart-qty-btn"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>

                  <span className="swiggy-cart-item-price">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggestions Box */}
            <div className="swiggy-cart-instructions">
              <input
                type="text"
                placeholder="Any suggestions? e.g. Send extra cutlery, spicy..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
            </div>

            {/* Delivery Address */}
            <div className="swiggy-cart-address-card">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <FiMapPin style={{ color: '#fc8019', marginTop: '3px' }} size={16} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '13px', color: '#02060c' }}>Deliver to</strong>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="swiggy-cart-address-input"
                  />
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="swiggy-cart-bill-details">
              <h4 className="swiggy-bill-title">Bill Details</h4>
              <div className="swiggy-bill-row">
                <span>Item Total</span>
                <span>₹{total}</span>
              </div>
              <div className="swiggy-bill-row">
                <span>Delivery Fee | 2.5 kms</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: '#117a37', fontWeight: 700 }}>
                      <s style={{ color: '#9e9e9e', marginRight: 4 }}>₹35</s> FREE
                    </span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="swiggy-bill-row">
                <span>Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="swiggy-bill-row">
                <span>GST and Restaurant Charges</span>
                <span>₹{gstCharges}</span>
              </div>
              <hr className="swiggy-bill-divider" />
              <div className="swiggy-bill-total-row">
                <span>TO PAY</span>
                <span>₹{finalPayTotal}</span>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="swiggy-cancellation-note">
              <strong>Review your order and address details to avoid cancellations</strong>
              <p>Note: Orders once placed cannot be cancelled and are non-refundable.</p>
            </div>
          </div>
        )}

        {/* Bottom Checkout Button Bar */}
        {!orderSuccess && items.length > 0 && (
          <div className="swiggy-cart-footer">
            <button
              className="swiggy-checkout-btn"
              onClick={handleCheckout}
              disabled={isOrdering}
              id="checkout-btn"
            >
              <span>{isOrdering ? 'PLACING ORDER...' : `TO PAY ₹${finalPayTotal}`}</span>
              <span className="swiggy-checkout-arrow">
                PROCEED TO PAY <FiArrowRight />
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
