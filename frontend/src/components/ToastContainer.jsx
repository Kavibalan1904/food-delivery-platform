import { FiCheck } from 'react-icons/fi'

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div className="toast" key={toast.id} style={{
          borderLeftColor: toast.type === 'error' ? 'var(--error)' : 'var(--success)'
        }}>
          <FiCheck className="toast-icon" style={{
            color: toast.type === 'error' ? 'var(--error)' : 'var(--success)'
          }} />
          <span className="toast-text">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
