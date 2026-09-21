import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../api";
import "./Home.css";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    if (apiClient.isAuthenticated()) {
      setIsAuthenticated(true);
      try {
        const response = await apiClient.getMe();
        setUserName(response.user?.name || "");
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setUserName("");
    navigate("/");
  };

  return (
    <div className="home">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">CivicResolve</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/report">Report Issue</Link>
          <Link to="/complaints">My Complaints</Link>
          {isAuthenticated ? (
            <>
              <span className="user-name">{userName}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
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
          {categories.length > 0 ? (
            categories.map(cat => (
              <div className="category-card" key={cat.id}>
                <div className="category-icon">{cat.icon || '📋'}</div>
                <h3>{cat.name}</h3>
              </div>
            ))
          ) : (
            <>
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
            </>
          )}

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