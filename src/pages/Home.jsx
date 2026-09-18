import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">CivicResolve</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/report">Report Issue</Link>
          <Link to="/complaints">My Complaints</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">

        <div className="hero-content">

          <h1>
            Report. <span>Track.</span> Resolve.
          </h1>

          <p>
            Report civic issues in your area, track your complaints,
            and stay connected with the concerned authorities through
            a simple and transparent platform.
          </p>

          <div className="hero-buttons">

            <Link to="/report">
              <button className="primary-btn">
                Report an Issue
              </button>
            </Link>

            <Link to="/complaints">
              <button className="secondary-btn">
                Track Complaint
              </button>
            </Link>

          </div>

        </div>

        <div className="hero-image">
          🏙️
        </div>

      </section>

      {/* Categories */}
      <section className="categories">

        <h2 className="section-title">
          Report Civic Issues
        </h2>

        <p className="section-description">
          Easily report common civic problems in your locality.
        </p>

        <div className="category-grid">

          <div className="category-card">
            <div className="category-icon">🛣️</div>
            <h3>Potholes</h3>
          </div>

          <div className="category-card">
            <div className="category-icon">🗑️</div>
            <h3>Garbage</h3>
          </div>

          <div className="category-card">
            <div className="category-icon">💧</div>
            <h3>Water Leakage</h3>
          </div>

          <div className="category-card">
            <div className="category-icon">💡</div>
            <h3>Streetlights</h3>
          </div>

          <div className="category-card">
            <div className="category-icon">🚰</div>
            <h3>Drainage</h3>
          </div>

        </div>

      </section>

      {/* How It Works */}
      <section className="how-it-works">

        <h2 className="section-title">
          How It Works
        </h2>

        <p className="section-description">
          A simple process from reporting an issue to resolution.
        </p>

        <div className="steps-grid">

          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Report</h3>
            <p>
              Submit the civic issue with details, image, and location.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>AI Assistance</h3>
            <p>
              AI assists in categorizing and prioritizing the complaint.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Authority Action</h3>
            <p>
              The concerned authority reviews and handles the issue.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track Resolution</h3>
            <p>
              Track the complaint status until it is resolved.
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          © 2026 CivicResolve | AI-Based Civic Issue Resolution System
        </p>
      </footer>

    </div>
  );
}

export default Home;