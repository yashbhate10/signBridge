import React, { useEffect, useRef, useState } from 'react';
import './WebcamFeed.css';
import { translateToMarathi, speakText } from '../../utils/translationUtils';

function WebcamFeed({ language }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessingRef = useRef(false);

  const predictionHistoryRef = useRef([]);
  const lastLetterRef = useRef('');

  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentLetter, setCurrentLetter] = useState('');
  const [sentence, setSentence] = useState('');
  const [marathiText, setMarathiText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);

  const API_URL = "https://outfly-earringed-roberta.ngrok-free.dev";

async function sendFrameAsync(formData) {
  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });

      const data = await res.json();

      if (!data || data.letter === undefined) return;

      handleStablePrediction(data);
      setConfidence(data.confidence || 80);
    } catch (err) {
      console.error(err);
      setError('Backend connection failed');
    }
  }

  function startProcessing() {
    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || video.readyState !== 4) {
        requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      canvas.width = 224;
      canvas.height = 224;

      ctx.drawImage(video, 0, 0, 224, 224);

      if (!isProcessingRef.current) {
        isProcessingRef.current = true;

        canvas.toBlob(async (blob) => {
          if (!blob) {
            isProcessingRef.current = false;
            return;
          }

          const formData = new FormData();
          formData.append('file', blob);

          await sendFrameAsync(formData);

          setTimeout(() => {
            isProcessingRef.current = false;
          }, 100);
        }, 'image/jpeg', 0.7);
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  useEffect(() => {
    const startCamera = async () => {
      try {
        setLoading(true);
        setError('');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 60 },
          },
          audio: false,
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        startProcessing();
      } catch (err) {
        console.error(err);
        setError('Unable to access camera.');
      } finally {
        setLoading(false);
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    if (cameraOn) startCamera();
    else stopCamera();

    return () => stopCamera();
  }, [cameraOn]);

  function handleStablePrediction(data) {
    const current = data.letter;

    predictionHistoryRef.current.push(current);

    if (predictionHistoryRef.current.length > 5) {
      predictionHistoryRef.current.shift();
    }

    const freq = {};
    predictionHistoryRef.current.forEach((l) => {
      freq[l] = (freq[l] || 0) + 1;
    });

    let stable = '';
    let max = 0;

    for (let key in freq) {
      if (freq[key] > max) {
        max = freq[key];
        stable = key;
      }
    }

    if (max >= 3 && stable !== lastLetterRef.current) {
      let output = stable;

      if (stable === 'space') output = ' ';
      else if (stable === 'del') {
        setSentence((prev) => prev.slice(0, -1));
        lastLetterRef.current = stable;
        return;
      }

      setCurrentLetter(output);
      setSentence((prev) => prev + output);
      setMarathiText(translateToMarathi(stable));

      lastLetterRef.current = stable;
    }
  }

  const speakDetected = () => {
    if (language === 'mr') {
      speakText(marathiText, 'mr-IN');
    } else {
      speakText(sentence, 'en-US');
    }
  };

  const removeLastLetter = () => {
    setSentence((prev) => prev.slice(0, -1));
  };

  const completeSentence = () => {
    if (!sentence.trim()) return;

    const historyItem = language === 'mr' ? translateToMarathi(sentence.trim()) : sentence.trim();
    setHistory((prev) => [historyItem, ...prev]);
    setSentence('');
    setCurrentLetter('');
  };

  return (
    <div className="webcam-feed">
      <div className="webcam-container">
        <div className="video-wrapper">
          {/* Corner brackets for scanner feel */}
          <div className="corner-tr"></div>
          <div className="corner-bl"></div>

          {/* Live label */}
          {cameraOn && !loading && !error && (
            <div className="video-label">
              <span className="video-label-dot"></span>
              LIVE DETECTION
            </div>
          )}

          {/* Scan line when camera on */}
          {cameraOn && !loading && !error && (
            <div className="scan-overlay"></div>
          )}

          <video
            ref={videoRef}
            className="canvas-element live-video"
            autoPlay
            muted
            playsInline
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!cameraOn && !loading && !error && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">📷</div>
              <p>{language === 'mr' ? 'कॅमेरा सुरू करा' : 'Start camera to begin detection'}</p>
            </div>
          )}

          {loading && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">⏳</div>
              <p>{language === 'mr' ? 'लोड होत आहे...' : 'Initializing camera...'}</p>
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
          <button className="btn btn-primary" onClick={() => setCameraOn((prev) => !prev)}>
            {cameraOn
              ? language === 'mr' ? '📷 कॅमेरा बंद करा' : '■ Stop Camera'
              : language === 'mr' ? '📷 कॅमेरा सुरू करा' : '▶ Start Camera'}
          </button>
        </div>
      </div>

      <div className="translation-panel">
        <div className="panel-header">
          <h3>{language === 'mr' ? 'अनुवाद आउटपुट' : 'Translation Output'}</h3>
          <span className="panel-badge">
            <span className="video-label-dot"></span>
            LIVE
          </span>
        </div>

        <div className="output-display">
          <div className="output-card">
            <div className="detected-sign">
              <span className="label">Detected Letter</span>
              <span className="text">
                {currentLetter ? (currentLetter === ' ' ? '␣' : currentLetter) : '—'}
              </span>
            </div>
          </div>

          <div className="output-card">
            <div className="marathi-translation">
              <span className="label">Sentence</span>
              <span className="text sentence-text">
                {sentence || (language === 'mr' ? 'जेश्चरची प्रतीक्षा...' : 'Waiting for gesture...')}
              </span>
            </div>
          </div>

          <div className="output-card">
            <div className="confidence-bar">
              <span className="label">Confidence — {confidence}%</span>
              <div className="progress">
                <div className="progress-fill" style={{ width: `${confidence}%` }}></div>
              </div>
            </div>
          </div>

          <div className="action-row">
            <button className="btn btn-secondary" onClick={removeLastLetter}>
              ⌫ Delete
            </button>
            <button className="btn btn-success" onClick={completeSentence}>
              ✓ Done
            </button>
            <button className="btn btn-secondary" onClick={speakDetected}>
              🔊 Speak
            </button>
          </div>

          <div className="history-card">
            <div className="history-card-header">
              <span className="label">History</span>
            </div>
            {history.length === 0 ? (
              <p className="history-empty">No sentences yet</p>
            ) : (
              <ul className="history-list">
                {history.map((item, index) => (
                  <li key={index} className="history-item">{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebcamFeed;