import os
import requests
import base64
import time

def generate_audio(text: str, group_name: str) -> str:
    """
    Calls the ElevenLabs TTS API to generate audio from text.
    Returns a base64 encoded string of the audio or a direct URL if stored.
    For simplicity, we'll return a data URI (base64) so the frontend can play it directly.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY environment variable is missing")
        
    # Using a generic voice ID (e.g., Rachel or a Vietnamese voice if available)
    # Replace VOICE_ID with a suitable Vietnamese voice from ElevenLabs
    VOICE_ID = "0ggMuQ1r9f9jqBu50nJn" # Bella (example voice ID, might need adjustment)
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    # We prefix the group name so the audio says "Nhóm 1 thân mến..."
    full_text = f"Chào {group_name}. Cô sẽ tiến hành nhận xét bài của các em nhé. {text}"
    
    data = {
        "text": full_text,
        "model_id": "eleven_v3", # Important for Vietnamese support
        # "model_id": "eleven_flash_v2_5",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code != 200:
        print(f"ElevenLabs error: {response.text}")
        return "" # In a real app we might throw an exception or return error messag
        
    # Convert audio stream to base64 Data URI
    audio_b64 = base64.b64encode(response.content).decode('utf-8')
    data_uri = f"data:audio/mpeg;base64,{audio_b64}"
    
    return data_uri
