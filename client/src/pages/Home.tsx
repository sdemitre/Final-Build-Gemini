import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Advancing Public Health Through Collaborative Research</h1>
            <p className="hero-subtitle">
              Connect with researchers worldwide, share unpublished work for peer review, 
              and collaborate on infectious disease research that saves lives.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Join as Researcher
                  </Link>
                  <Link to="/papers" className="btn btn-secondary btn-lg">
                    Browse Research
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Submit & Review Papers</h3>
              <p>Share unpublished research, proposals, and funded projects for informal peer review and collaborative feedback.</p>
              <Link to="/papers" className="feature-link">Browse Papers →</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Disease Tracking</h3>
              <p>Interactive world map showing current infectious disease outbreaks, endemic areas, and epidemiological data.</p>
              <Link to="/disease-map" className="feature-link">View Disease Map →</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Research Collaboration</h3>
              <p>Connect with researchers, form partnerships, and combine data for joint publications and projects.</p>
              <Link to="/researchers" className="feature-link">Find Researchers →</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Career Opportunities</h3>
              <p>Discover job openings, research positions, and funding opportunities in public health and infectious diseases.</p>
              <Link to="/jobs" className="feature-link">View Jobs →</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Data Repository</h3>
              <p>Access and contribute to a comprehensive database of research data, both published and unpublished.</p>
              <Link to="/papers" className="feature-link">Access Data →</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3>Verified Research</h3>
              <p>All submissions are vetted and come from researchers affiliated with recognized institutions and funding sources.</p>
              {!user && <Link to="/register" className="feature-link">Join Platform →</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats">
        <div className="container">
          <h2 className="section-title">Platform Impact</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">Verified Researchers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">Research Papers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">450+</div>
              <div className="stat-label">Active Collaborations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">85+</div>
              <div className="stat-label">Countries Represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Join the Global Research Community?</h2>
              <p>
                Connect with leading public health researchers, share your work, 
                and contribute to advancing infectious disease research worldwide.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Register Now
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;