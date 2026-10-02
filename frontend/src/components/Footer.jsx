import { MdDeliveryDining } from 'react-icons/md'
import { FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="navbar-logo-icon">
                <MdDeliveryDining />
              </div>
              SwiftBite
            </div>
            <p className="footer-desc">
              Delivering happiness one bite at a time. Order from the best restaurants
              near you with lightning-fast delivery and real-time tracking.
            </p>
            <div className="footer-socials">
              <a className="footer-social-link" href="#" aria-label="Instagram"><FiInstagram /></a>
              <a className="footer-social-link" href="#" aria-label="Twitter"><FiTwitter /></a>
              <a className="footer-social-link" href="#" aria-label="Facebook"><FiFacebook /></a>
              <a className="footer-social-link" href="#" aria-label="LinkedIn"><FiLinkedin /></a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">Company</h3>
            <div className="footer-links">
              <a className="footer-link" href="#">About Us</a>
              <a className="footer-link" href="#">Careers</a>
              <a className="footer-link" href="#">Blog</a>
              <a className="footer-link" href="#">Partner with Us</a>
              <a className="footer-link" href="#">Contact</a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">Support</h3>
            <div className="footer-links">
              <a className="footer-link" href="#">Help Center</a>
              <a className="footer-link" href="#">Safety</a>
              <a className="footer-link" href="#">Terms of Service</a>
              <a className="footer-link" href="#">Privacy Policy</a>
              <a className="footer-link" href="#">Refund Policy</a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">For Restaurants</h3>
            <div className="footer-links">
              <a className="footer-link" href="#">Partner with Us</a>
              <a className="footer-link" href="#">Restaurant Dashboard</a>
              <a className="footer-link" href="#">For Delivery Partners</a>
              <a className="footer-link" href="#">API Documentation</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SwiftBite Technologies Pvt. Ltd. All rights reserved.</span>
          <span>Made with 🧡 in Chennai, India</span>
        </div>
      </div>
    </footer>
  )
}
