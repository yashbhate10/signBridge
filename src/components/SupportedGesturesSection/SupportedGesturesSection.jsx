import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SupportedGesturesSection.css';

function SupportedGesturesSection({ language }) {
  const navigate = useNavigate();

  return (
    <section className="supported-gestures-section" id="gestures">
      <div className="container">
        <div className="section-header">
          <div className="gesture-badge">
            <span>✨</span>
            {language === 'mr' ? 'दैनंदिन संवादासाठी' : 'For Daily Communication'}
          </div>

          <h2 className="section-title">
            {language === 'mr' ? 'समर्थित जेश्चर' : 'Supported Gestures'}
          </h2>

          <p className="section-subtitle">
            {language === 'mr'
              ? 'अक्षरे, संख्या आणि वाक्ये स्वतंत्रपणे पाहा'
              : 'Explore letters, numbers, and phrases separately'}
          </p>
        </div>

        <div className="gesture-category-grid">
          <div
            className="category-card"
            onClick={() => navigate('/gestures/letters')}
          >
            <div className="category-preview">
              <img src="/sign/a.gif" alt="Letters" />
            </div>
            <h3>{language === 'mr' ? 'अक्षरे' : 'Letters'}</h3>
            <p>
              {language === 'mr'
                ? 'A ते Z पर्यंतची सर्व साइन पहा'
                : 'View all alphabet signs from A to Z'}
            </p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate('/gestures/numbers')}
          >
            <div className="category-preview">
              <img src="/sign/1.gif" alt="Numbers" />
            </div>
            <h3>{language === 'mr' ? 'संख्या' : 'Numbers'}</h3>
            <p>
              {language === 'mr'
                ? '० ते ९ पर्यंतच्या सर्व संख्या पहा'
                : 'View all number signs from 0 to 9'}
            </p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate('/gestures/phrases')}
          >
            <div className="category-preview">
              <img src="/sign/hello.gif" alt="Phrases" />
            </div>
            <h3>{language === 'mr' ? 'वाक्ये / शब्द' : 'Phrases'}</h3>
            <p>
              {language === 'mr'
                ? 'दैनंदिन संवादासाठी वापरली जाणारी जेश्चर'
                : 'Daily communication gesture phrases'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportedGesturesSection;