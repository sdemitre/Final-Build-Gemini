import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>PH Research Hub</h3>
            <p>Connecting public health researchers worldwide for collaborative research and knowledge sharing.</p>
          </div>
          
          <div className="footer-section">
            <h4>Research</h4>
            <ul>
              <li><a href="/papers">Browse Papers</a></li>
              <li><a href="/submit-paper">Submit Research</a></li>
              <li><a href="/disease-map">Disease Map</a></li>
              <li><a href="/researchers">Find Researchers</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><a href="/collaborations">Collaborations</a></li>
              <li><a href="/jobs">Job Opportunities</a></li>
              <li><a href="/guidelines">Submission Guidelines</a></li>
              <li><a href="/peer-review">Peer Review Process</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Public Health Research Hub. All rights reserved.</p>
          <p className="footer-note">
            Supporting evidence-based public health research and infectious disease prevention worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;