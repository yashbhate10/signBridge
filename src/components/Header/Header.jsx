import React from "react";
import "./Header.css";

function Header({ language, toggleLanguage }) {
  return (
    <header className="header">
      <div className="header-container">
        <a href="#home" className="brand-link">
          <div className="logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 20C12 16.6 14 13.2 20 13.2C26 13.2 28 16.6 28 20"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="15" cy="24" r="2" fill="white" />
              <circle cx="20" cy="26" r="2" fill="white" />
              <circle cx="25" cy="24" r="2" fill="white" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">SignBridge</span>
          </div>
        </a>

        <nav className="header-nav">
          <a href="#home" className="nav-link">{language === "mr" ? "मुख्य" : "Home"}</a>
          <a href="#demo" className="nav-link">{language === "mr" ? "Live Demo" : "Live Demo"}</a>
          <a href="#features" className="nav-link">{language === "mr" ? "Features" : "Features"}</a>
          <a href="#gestures" className="nav-link">{language === "mr" ? "Gestures" : "Gestures"}</a>
          <a href="#usecases" className="nav-link">{language === "mr" ? "Use Cases" : "Use Cases"}</a>
          <a href="#contact" className="nav-link">{language === "mr" ? "Contact" : "Contact"}</a>
        </nav>

        <div className="header-actions">
          <div className="language-toggle">
            <button
              className={`lang-btn ${language === "en" ? "active" : ""}`}
              onClick={() => language !== "en" && toggleLanguage()}
            >
              EN
            </button>
            <button
              className={`lang-btn ${language === "mr" ? "active" : ""}`}
              onClick={() => language !== "mr" && toggleLanguage()}
            >
              मराठी
            </button>
          </div>

          <a href="#demo" className="btn btn-primary nav-btn">
            Try Demo
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;