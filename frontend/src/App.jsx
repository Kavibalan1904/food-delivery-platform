import { Routes, Route } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import OrdersPage from './pages/OrdersPage'
import CartSidebar from './components/CartSidebar'
import AuthModal from './components/AuthModal'
import ToastContainer from './components/ToastContainer'

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [toasts, setToasts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  // Restore authenticated user session on load
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data)
      } catch (err) {
        console.warn('Session expired or invalid token:', err)
        localStorage.removeItem('token')
      }
    }
    restoreSession()
  }, [])

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id)
      if (existing) {
        return prev.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    addToast(`${item.name} added to cart!`, 'success')
  }, [addToast])

  const updateCartQuantity = useCallback((itemId, delta) => {
    setCart(prev => {
      return prev
        .map(i => i._id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    })
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const handleLogin = useCallback((userData, token) => {
    setUser(userData)
    if (token) localStorage.setItem('token', token)
    setIsAuthOpen(false)
    addToast(`Welcome back, ${userData.name}!`, 'success')
  }, [addToast])

  const handleLogout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('token')
    addToast('Logged out successfully', 'info')
  }, [addToast])

  return (
    <div className="app">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => { setAuthMode('login'); setIsAuthOpen(true) }}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                addToCart={addToCart}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            }
          />
          <Route
            path="/restaurant/:id"
            element={
              <RestaurantPage
                addToCart={addToCart}
                cart={cart}
                onUpdateQuantity={updateCartQuantity}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <OrdersPage
                user={user}
                addToCart={addToCart}
                addToast={addToast}
              />
            }
          />
          <Route
            path="/order/:id"
            element={
              <OrdersPage
                user={user}
                addToCart={addToCart}
                addToast={addToast}
              />
            }
          />
        </Routes>
      </main>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        total={cartTotal}
        addToast={addToast}
        clearCart={clearCart}
        user={user}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}
        onLogin={handleLogin}
        addToast={addToast}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
