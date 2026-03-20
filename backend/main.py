from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import mediapipe as mp
import joblib
import time
from collections import deque, Counter
import os
import uvicorn

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load trained model
model = joblib.load("sign_model.pkl")

# ✅ MediaPipe (FAST MODE)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=1,
    model_complexity=0
)

# 🔥 smoothing buffer
prediction_buffer = deque(maxlen=5)

# 🔥 word formation state
current_word = ""
last_letter = ""
last_time = 0


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global current_word, last_letter, last_time

    try:
        print("\n🔥 API HIT")

        # ✅ FAST IMAGE READ (NO BASE64)
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"sign": current_word, "letter": ""}

        # 🔥 resize → faster processing
        frame = cv2.resize(frame, (320, 240))

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # 🔹 Detect hand
        result = hands.process(rgb)

        print("Hand detected:", bool(result.multi_hand_landmarks))

        if result.multi_hand_landmarks:

            for hand_landmarks in result.multi_hand_landmarks:

                # 🔥 STEP 1: collect landmarks
                landmarks = [(lm.x, lm.y, lm.z) for lm in hand_landmarks.landmark]

                # 🔥 STEP 2: normalize (VERY IMPORTANT)
                xs = [x for x, y, z in landmarks]
                ys = [y for x, y, z in landmarks]

                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)

                feature = []

                for x, y, z in landmarks:
                    feature.append((x - min_x) / (max_x - min_x + 1e-6))
                    feature.append((y - min_y) / (max_y - min_y + 1e-6))
                    feature.append(z)

                print("Feature length:", len(feature))  # should be 63

                # 🔥 STEP 3: prediction
                proba = model.predict_proba([feature])[0]
                prediction = model.predict([feature])[0].lower()

                # 🔥 STEP 4: smoothing
                prediction_buffer.append(prediction)

                most_common = Counter(prediction_buffer).most_common(1)[0][0]
                freq = Counter(prediction_buffer)[most_common]
                confidence = freq / len(prediction_buffer)

                print("Smoothed:", most_common, "Confidence:", confidence)

                # 🔥 reject unstable predictions
                if confidence < 0.6:
                    return {"sign": current_word, "letter": ""}

                prediction = most_common

                current_time = time.time()

                # 🔥 avoid repeated letters
                if prediction != last_letter and (current_time - last_time) > 1.0:

                    if prediction == "space":
                        current_word += " "

                    elif prediction == "del":
                        current_word = current_word[:-1]

                    else:
                        current_word += prediction

                    last_letter = prediction
                    last_time = current_time

                # ✅ send response
                return {
                    "sign": current_word,
                    "letter": prediction,
                    "confidence": round(confidence * 100, 2)
                }

        return {"sign": current_word, "letter": ""}

    except Exception as e:
        print("❌ ERROR:", e)
        return {"sign": current_word, "letter": ""}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)