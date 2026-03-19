import React, { useEffect, useRef, useState } from 'react';
import './WebcamFeed.css';
import { translateToMarathi, speakText } from '../../utils/translationUtils';

function WebcamFeed({ language }) {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null); // ✅ FIX

  const predictionHistoryRef = useRef([]);
  const lastLetterRef = useRef("");

  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentLetter, setCurrentLetter] = useState("");
  const [sentence, setSentence] = useState("");
  const [marathiText, setMarathiText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState("");

  /////////////////////////
  // 🚀 NON-BLOCKING API
  /////////////////////////

function sendFrameAsync(formData) {

  fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (!data || data.letter === undefined) return;

    handleStablePrediction(data);
    setConfidence(data.confidence || 80);
  })
  .catch(err => {
    console.error(err);
    setError("Backend connection failed");
  });
}

  /////////////////////////
  // 🔥 FAST PROCESSING LOOP
  /////////////////////////

  function startProcessing() {

    intervalRef.current = setInterval(() => {

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || video.readyState !== 4) return;

      const ctx = canvas.getContext("2d");

      // 🔥 SMALL SIZE = HUGE PERFORMANCE BOOST
      canvas.width = 224;
      canvas.height = 224;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 🔥 LIGHT ENCODING
      canvas.toBlob((blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("file", blob);

            sendFrameAsync(formData);

          }, "image/jpeg", 0.5);

      sendFrameAsync(image);

    }, 600); // 🔥 BEST BALANCE
  }

  /////////////////////////
  // 🎥 CAMERA CONTROL
  /////////////////////////

  useEffect(() => {

    const startCamera = async () => {
      try {
        setLoading(true);
        setError("");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        startProcessing(); // ✅ ONLY THIS LOOP

      } catch (err) {
        console.error(err);
        setError("Unable to access camera.");
      } finally {
        setLoading(false);
      }
    };

    const stopCamera = () => {

      if (intervalRef.current) {
        clearInterval(intervalRef.current); // ✅ FIX
      }

      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (cameraOn) startCamera();
    else stopCamera();

    return () => stopCamera();

  }, [cameraOn]);

  /////////////////////////
  // 🧠 STABILITY LOGIC
  /////////////////////////

  function handleStablePrediction(data) {

    const current = data.letter;

    predictionHistoryRef.current.push(current);

    if (predictionHistoryRef.current.length > 5) {
      predictionHistoryRef.current.shift();
    }

    const freq = {};
    predictionHistoryRef.current.forEach(l => {
      freq[l] = (freq[l] || 0) + 1;
    });

    let stable = "";
    let max = 0;

    for (let key in freq) {
      if (freq[key] > max) {
        max = freq[key];
        stable = key;
      }
    }

    if (max >= 3 && stable !== lastLetterRef.current) {

      let output = stable;

      if (stable === "space") {
        output = " ";
      }
      else if (stable === "del") {
        setSentence(prev => prev.slice(0, -1));
        lastLetterRef.current = stable;
        return;
      }

      setCurrentLetter(output);
      setSentence(prev => prev + output);

      setMarathiText(translateToMarathi(stable));

      lastLetterRef.current = stable;
    }
  }

  /////////////////////////
  // 🔊 SPEAK
  /////////////////////////

  const speakDetected = () => {
    if (language === "mr") {
      speakText(marathiText, "mr-IN");
    } else {
      speakText(sentence, "en-US");
    }
  };

  /////////////////////////
  // 🎨 UI
  /////////////////////////

  return (
    <div className="webcam-feed">

      <div className="webcam-container">
        <div className="video-wrapper">

          <video ref={videoRef} className="canvas-element live-video" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="canvas-element overlay-canvas" />

          {!cameraOn && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">📷</div>
              <p>{language === 'mr' ? 'कॅमेरा सुरू करा' : 'Start camera to begin detection'}</p>
            </div>
          )}

          {loading && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">⏳</div>
              <p>{language === 'mr' ? 'लोड होत आहे...' : 'Loading...'}</p>
            </div>
          )}

          {error && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">⚠️</div>
              <p>{error}</p>
            </div>
          )}

        </div>

        <div className="controls">
          <button className="btn btn-primary" onClick={() => setCameraOn(prev => !prev)}>
            {cameraOn
              ? language === 'mr' ? 'कॅमेरा बंद करा' : 'Stop Camera'
              : language === 'mr' ? 'कॅमेरा सुरू करा' : 'Start Camera'}
          </button>
        </div>
      </div>

      <div className="translation-panel">

        <div className="panel-header">
          <h3>{language === 'mr' ? 'अनुवाद आउटपुट' : 'Translation Output'}</h3>
        </div>

        <div className="output-display">

          {currentLetter ? (
            <>
              <div className="detected-sign">
                <span className="label">Detected Letter</span>
                <span className="text">
                  {currentLetter === " " ? "␣ (space)" : currentLetter}
                </span>
              </div>

              <div className="marathi-translation">
                <span className="label">Sentence</span>
                <span className="text">{sentence}</span>
              </div>

              <div className="confidence-bar">
                <span className="label">Confidence</span>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${confidence}%` }}></div>
                </div>
                <span className="percentage">{confidence}%</span>
              </div>

              <button className="btn btn-secondary speak-btn" onClick={speakDetected}>
                🔊 Speak
              </button>
            </>
          ) : (
            <div className="empty-state">
              <p>{language === 'mr' ? 'जेश्चरची प्रतीक्षा...' : 'Waiting for gesture...'}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default WebcamFeed;