import { FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="swiggy-footer" id="footer">
      {/* Download Swiggy App Banner */}
      <div className="swiggy-app-banner">
        <div className="swiggy-container swiggy-app-banner-inner">
          <h3 className="swiggy-app-banner-title">
            For better experience, download the Bite app now
          </h3>
          <div className="swiggy-app-badges">
            <a
              href="https://play.google.com/store"
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
              href="https://apps.apple.com"
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
                <defs>
                  <linearGradient id="biteOrangeFooter" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF9233" />
                    <stop offset="100%" stopColor="#FC8019" />
                  </linearGradient>
                </defs>
                <rect width="500" height="500" rx="125" fill="url(#biteOrangeFooter)" />
                <g transform="skewX(-10) translate(40, 0)">
                  <polygon points="70,215 155,215 135,240 50,240" fill="white" />
                  <polygon points="40,265 145,265 125,290 20,290" fill="white" />
                  <polygon points="65,315 150,315 130,340 45,340" fill="white" opacity="0.9" />
                  <path d="M160 120H285C345 120 380 152 380 205C380 238 358 264 320 276C365 288 392 318 392 362C392 418 345 448 285 448H160C146 448 135 437 135 423V145C135 131 146 120 160 120ZM205 180V244H276C298 244 316 232 316 212C316 192 298 180 276 180H205ZM205 316V388H282C308 388 326 374 326 352C326 330 308 316 282 316H205Z" fill="white" />
                </g>
              </svg>
              <span className="swiggy-footer-wordmark">Bite</span>
            </div>
            <p className="swiggy-footer-copy">
              © 2026 Bite Technologies Pvt. Ltd.
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
