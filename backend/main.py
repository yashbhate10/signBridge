from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import mediapipe as mp
import joblib
import time
from collections import deque, Counter

app = FastAPI()

# ✅ CORS (allow all)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load model
model = joblib.load("sign_model.pkl")

# ✅ MediaPipe setup (fast mode)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=1,
    model_complexity=0
)

# 🔥 smoothing
prediction_buffer = deque(maxlen=5)

# 🔥 word state
current_word = ""
last_letter = ""
last_time = 0


@app.get("/")
def home():
    return {"message": "SignBridge Backend Running 🚀"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global current_word, last_letter, last_time

    try:
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"sign": current_word, "letter": ""}

        # resize for speed
        frame = cv2.resize(frame, (320, 240))
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        result = hands.process(rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:

                landmarks = [(lm.x, lm.y, lm.z) for lm in hand_landmarks.landmark]

                xs = [x for x, y, z in landmarks]
                ys = [y for x, y, z in landmarks]

                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)

                feature = []

                for x, y, z in landmarks:
                    feature.append((x - min_x) / (max_x - min_x + 1e-6))
                    feature.append((y - min_y) / (max_y - min_y + 1e-6))
                    feature.append(z)

                # prediction
                proba = model.predict_proba([feature])[0]
                prediction = model.predict([feature])[0].lower()

                # smoothing
                prediction_buffer.append(prediction)
                most_common = Counter(prediction_buffer).most_common(1)[0][0]
                freq = Counter(prediction_buffer)[most_common]
                confidence = freq / len(prediction_buffer)

                if confidence < 0.6:
                    return {"sign": current_word, "letter": ""}

                prediction = most_common
                current_time = time.time()

                # avoid repeat
                if prediction != last_letter and (current_time - last_time) > 1.0:

                    if prediction == "space":
                        current_word += " "
                    elif prediction == "del":
                        current_word = current_word[:-1]
                    else:
                        current_word += prediction

                    last_letter = prediction
                    last_time = current_time

                return {
                    "sign": current_word,
                    "letter": prediction,
                    "confidence": round(confidence * 100, 2)
                }

        return {"sign": current_word, "letter": ""}

    except Exception as e:
        print("❌ ERROR:", e)
        return {"sign": current_word, "letter": ""}