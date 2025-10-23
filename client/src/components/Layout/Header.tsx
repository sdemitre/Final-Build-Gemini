import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>PH Research Hub</h1>
          </Link>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              <li><Link to="/papers" onClick={() => setIsMenuOpen(false)}>Research Papers</Link></li>
              <li><Link to="/disease-map" onClick={() => setIsMenuOpen(false)}>Disease Map</Link></li>
              <li><Link to="/researchers" onClick={() => setIsMenuOpen(false)}>Researchers</Link></li>
              <li><Link to="/jobs" onClick={() => setIsMenuOpen(false)}>Jobs</Link></li>
              
              {user ? (
                <>
                  <li><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>
                  <li><Link to="/submit-paper" onClick={() => setIsMenuOpen(false)}>Submit Paper</Link></li>
                  <li><Link to="/collaborations" onClick={() => setIsMenuOpen(false)}>Collaborations</Link></li>
                  <li><Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link></li>
                  <li>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
                  <li>
                    <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <button 
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export { Header };
export default Header;