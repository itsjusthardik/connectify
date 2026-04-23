import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

/**
 * Footer Component
 * Minimal footer with logo, links, and copyright
 * Consistent across all pages
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }} className="mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <span className="text-xl font-bold font-display" style={{ color: 'var(--text)' }}>Connectify</span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Connecting creators with talent worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>For Creators</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>
                <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}>
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}>
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Talent */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>For Talent</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>
                <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}>
                  Join as Talent
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}>
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Legal</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>
                <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              Made with <Heart size={16} className="text-secondary" /> by Connectify Team
            </p>
            <p className="text-sm mt-4 md:mt-0" style={{ color: 'var(--text-muted)' }}>
              © {currentYear} Connectify. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
