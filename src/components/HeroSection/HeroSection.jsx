import React from "react";
import "./HeroSection.css";

function HeroSection() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-overlay"></div>
      <div className="hero-scan-line"></div>

      <div className="container hero-content">
        <div className="hero-left">
          <span className="hero-badge">
            <span className="hero-badge-dot"></span>
            AI SIGN LANGUAGE TRANSLATION
          </span>

          <h1 className="hero-title">
            Artificial Intelligence <br />
            Supported <span>Sign Language</span> <br />
            Translator
          </h1>

          <p className="hero-description">
            We enable hearing impaired and deaf individuals to access
            information and communicate through AI-powered Indian
            Sign Language translation in English and Marathi.
          </p>

          <div className="hero-buttons">
            <a href="#demo" className="hero-btn-primary">Try Live Demo →</a>
            <a href="#features" className="hero-link">Learn More ↓</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="stat-card">
            <span className="icon">🌐</span>
            <h3>2</h3>
            <p>LANGUAGES</p>
            <span>English + Marathi</span>
          </div>

          <div className="stat-card">
            <span className="icon">✋</span>
            <h3>ISL</h3>
            <p>BASED ON</p>
            <span>Indian Sign Language</span>
          </div>

          <div className="stat-card">
            <span className="icon">💻</span>
            <h3>100%</h3>
            <p>BROWSER</p>
            <span>No install needed</span>
          </div>

          <div className="stat-card">
            <span className="icon">⚡</span>
            <h3>Live</h3>
            <p>REAL-TIME</p>
            <span>Instant detection</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;