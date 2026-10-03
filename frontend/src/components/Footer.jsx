import { FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="swiggy-footer" id="footer">
      {/* Download Swiggy App Banner */}
      <div className="swiggy-app-banner">
        <div className="swiggy-container swiggy-app-banner-inner">
          <h3 className="swiggy-app-banner-title">
            For better experience, download the Swiggy app now
          </h3>
          <div className="swiggy-app-badges">
            <a
              href="https://play.google.com/store/apps/details?id=in.swiggy.android"
              target="_blank"
              rel="noreferrer"
              className="swiggy-store-btn"
            >
              <img
                src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/m/play_store.png"
                alt="Get it on Google Play"
                height="50"
              />
            </a>
            <a
              href="https://apps.apple.com/in/app/swiggy-food-order-delivery/id989586536"
              target="_blank"
              rel="noreferrer"
              className="swiggy-store-btn"
            >
              <img
                src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/m/app_store.png"
                alt="Download on App Store"
                height="50"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="swiggy-container">
        <div className="swiggy-footer-grid">
          {/* Logo & Copyright */}
          <div className="swiggy-footer-brand">
            <div className="swiggy-footer-logo-row">
              <svg
                viewBox="0 0 500 500"
                width="36"
                height="36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="500" height="500" rx="120" fill="#FC8019" />
                <path
                  d="M250 85C170 85 105 150 105 230C105 295 185 390 242 452C246.5 456.8 253.5 456.8 258 452C315 390 395 295 395 230C395 150 330 85 250 85ZM250 165C286 165 315 194 315 230C315 266 286 295 250 295C214 295 185 266 185 230C185 194 214 165 250 165Z"
                  fill="white"
                />
              </svg>
              <span className="swiggy-footer-wordmark">Swiggy</span>
            </div>
            <p className="swiggy-footer-copy">
              © 2024 Swiggy Limited
            </p>
            <div className="swiggy-footer-socials">
              <a href="#" aria-label="Instagram"><FiInstagram size={18} /></a>
              <a href="#" aria-label="Twitter"><FiTwitter size={18} /></a>
              <a href="#" aria-label="Facebook"><FiFacebook size={18} /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin size={18} /></a>
            </div>
          </div>

          {/* Company */}
          <div className="swiggy-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Swiggy Corporate</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Team</a></li>
              <li><a href="#">Swiggy One</a></li>
              <li><a href="#">Swiggy Instamart</a></li>
              <li><a href="#">Swiggy Dineout</a></li>
            </ul>
          </div>

          {/* Contact us & Legal */}
          <div className="swiggy-footer-col">
            <h4>Contact us</h4>
            <ul>
              <li><a href="#">Help & Support</a></li>
              <li><a href="#">Partner with us</a></li>
              <li><a href="#">Ride with us</a></li>
            </ul>

            <h4 style={{ marginTop: '24px' }}>Legal</h4>
            <ul>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Available in */}
          <div className="swiggy-footer-col">
            <h4>Available in</h4>
            <ul>
              <li><a href="#">Bangalore</a></li>
              <li><a href="#">Chennai</a></li>
              <li><a href="#">Mumbai</a></li>
              <li><a href="#">Delhi</a></li>
              <li><a href="#">Hyderabad</a></li>
              <li><a href="#">Pune</a></li>
            </ul>
          </div>

          {/* Life at Swiggy */}
          <div className="swiggy-footer-col">
            <h4>Life at Swiggy</h4>
            <ul>
              <li><a href="#">Explore With Swiggy</a></li>
              <li><a href="#">Swiggy News</a></li>
              <li><a href="#">SnackBar</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
