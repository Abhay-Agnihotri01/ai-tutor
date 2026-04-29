import requests

try:
    res = requests.post("http://localhost:8000/v1/audio/speech", json={"model":"gpt-4o-mini-tts", "input":"Hello", "voice":"alloy", "speed": 1.0})
    print("Magic bytes:", res.content[:4])
except Exception as e:
    print("Error:", e)
