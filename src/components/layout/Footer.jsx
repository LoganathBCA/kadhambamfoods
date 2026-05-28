// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';

const WhatsAppSVG = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">
      <div className="footer__grid">
        {/* Brand */}
        <div className="footer__brand">
          <h2>Kadhambam</h2>
          <p>
            We believe in the harmony of nature. Our mission is to bridge the gap
            between conscientious cultivators and mindful consumers, delivering the
            finest quality nuts and dried fruits to your doorstep.
          </p>
          <div className="footer__socials">
            <a
              href="mailto:kadhambamfoods@gmail.com"
              className="footer__social-btn"
              style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}
              aria-label="Email"
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>mail</span>
            </a>
            <a
              href="https://wa.me/918825438334"
              className="footer__social-btn"
              style={{ background: 'var(--color-whatsapp)', color: 'white' }}
              aria-label="WhatsApp"
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppSVG size={20} />
            </a>
          </div>
        </div>

        {/* Company */}
        <div className="footer__col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/about">Sourcing Ethics</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/contact">Wholesale</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer__col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/contact">Shipping Details</Link></li>
            <li><Link to="/contact">Refund Policy</Link></li>
            <li><Link to="/contact">Privacy Policy</Link></li>
            <li><Link to="/contact">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          © 2025 Kadhambam. Premium Quality. All Rights Reserved.
          <span style={{ display: 'block', marginTop: 4, fontSize: 12, opacity: 0.8 }}>
            Developed by <a href="https://dshiners.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Dshiners</a>
          </span>
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>UPI · GPay · PhonePe · Paytm</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
