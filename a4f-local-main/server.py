import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import uvicorn
from a4f_local import A4F

app = FastAPI(title="a4f-local TTS Server")

client = A4F()

# Reverse-engineered APIs like a4f-local aggressively rate-limit or crash 
# if you spam them with 10 concurrent requests at once. We must serialize them.
tts_lock = asyncio.Lock()

class SpeechRequest(BaseModel):
    model: str = "tts-1"
    input: str
    voice: str = "alloy"

@app.post("/v1/audio/speech")
async def create_speech(req: SpeechRequest):
    try:
        # Wait in line so we only process one TTS request at a time
        async with tts_lock:
            # Run the synchronous generation in a separate thread so the server doesn't freeze
            audio_bytes = await asyncio.to_thread(
                client.audio.speech.create,
                model=req.model,
                input=req.input,
                voice=req.voice
            )
            # Add a short delay to respect the provider's heavy rate limit constraints
            await asyncio.sleep(1.5)
            
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print(f"Error generating TTS: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting a4f-local OpenAI-compatible TTS server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
