import React, { useState } from "react";
import "./TranslatorSection.css";
import WebcamFeed from "../WebcamFeed/WebcamFeed";
import TextTranslator from "../TextTranslator/TextTranslator";

function TranslatorSection({ language }) {
  const [mode, setMode] = useState("sign");

  return (
    <section className="translator-section" id="demo">
      <div className="container">
        <div className="translator-shell">
          <div className="translator-glow translator-glow-one"></div>
          <div className="translator-glow translator-glow-two"></div>

          <div className="translator-top">
            <div className="translator-copy">
              <span className="translator-badge">
                {language === "mr" ? "लाईव्ह उत्पादन अनुभव" : "Live Product Experience"}
              </span>

              <h2>
                {language === "mr"
                  ? "रिअल-टाइम संवादासाठी मुख्य कार्यक्षेत्र"
                  : "Your real-time communication workspace"}
              </h2>

              <p>
                {language === "mr"
                  ? "कॅमेरा, जेश्चर, मजकूर आणि आउटपुट एका आधुनिक अॅप इंटरफेसमध्ये वापरा."
                  : "Use camera input, gesture recognition, text translation, and output in one modern product interface."}
              </p>
            </div>

            <div className="translator-tabs">
              <button
                className={mode === "sign" ? "active" : ""}
                onClick={() => setMode("sign")}
              >
                <span>📷</span>
                {language === "mr" ? "साइन ते टेक्स्ट" : "Sign to Text"}
              </button>

              <button
                className={mode === "text" ? "active" : ""}
                onClick={() => setMode("text")}
              >
                <span>⌨️</span>
                {language === "mr" ? "टेक्स्ट ते साइन" : "Text to Sign"}
              </button>
            </div>
          </div>

          <div className="translator-window">
            <div className="window-bar">
              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="window-title">SignBridge Workspace</div>

              <div className="window-status">
                <span className="status-dot"></span>
                {language === "mr" ? "रिअल-टाइम" : "Real-time"}
              </div>
            </div>

            <div className="window-body">
              {mode === "sign" ? (
                <WebcamFeed language={language} />
              ) : (
                <TextTranslator language={language} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TranslatorSection;