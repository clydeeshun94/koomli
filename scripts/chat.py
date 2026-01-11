from __future__ import annotations

from typing import Any, Dict, List, Optional
import os
import json
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()


class OpenRouterChat:
    def __init__(self, api_key: Optional[str], model_name: str = "meta-llama/llama-3.1-8b-instruct:free") -> None:
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://openrouter.ai/api/v1"

    def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.3) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            print("[openrouter] Missing OPENROUTER_API_KEY; returning None.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",  # Required for OpenRouter
            "X-Title": "Plant Disease Detection AI"  # Optional but recommended
        }
        data = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
        }
        try:
            resp = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=data, timeout=30)
            if resp.status_code == 200:
                return resp.json()
            print(f"[openrouter] API error {resp.status_code}: {resp.text[:200]}")
            return None
        except Exception as e:
            print(f"[openrouter] Request error: {e}")
            return None


# Use the provided OpenRouter API key
OPENROUTER_API_KEY = "xxx"
openrouter_client = OpenRouterChat(OPENROUTER_API_KEY)


# Load class info from assets JSON
ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
CLASS_INFO_PATH = ASSETS_DIR / "class_info.json"

class_info_dict: Dict[str, str] = {}
try:
    with open(CLASS_INFO_PATH, "r", encoding="utf-8") as f:
        class_info_dict = json.load(f)
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"[openrouter] Warning: could not load {CLASS_INFO_PATH}: {e}")


def chatbot(info: str, history: List[Any], message: str) -> str:
    """
    Chatbot function using OpenRouter API with farming-expert persona.
    """
    messages: List[Dict[str, str]] = [
        {
            "role": "system",
            "content": (
                "You are Dr. AgriBot, a highly experienced agricultural expert and plant pathologist with over 20 years of experience in plant disease diagnosis and treatment. "
                "You specialize in helping farmers identify, treat, and prevent plant diseases. "
                "A farmer has uploaded an image of their plant, and our AI system has detected specific diseases. "
                "Your role is to provide practical, actionable advice based on the detected diseases. "
                "Always be encouraging, supportive, and provide clear step-by-step guidance. "
                "Focus on organic and sustainable treatment methods when possible, but also mention chemical treatments when necessary. "
                "Include prevention tips and explain the disease in simple terms that farmers can understand."
            ),
        }
    ]

    # Add chat history
    if history:
        for entry in history:
            if isinstance(entry, dict):
                if entry.get("user"):
                    messages.append({"role": "user", "content": entry["user"]})
                if entry.get("bot"):
                    messages.append({"role": "assistant", "content": entry["bot"]})
            else:
                messages.append({"role": "user", "content": str(entry)})

    # Create the user message with disease context
    user_content = f"""
Disease Detection Results: {info}

Farmer's Question: {message}

Please provide expert advice on this plant disease situation. Include:
1. What the disease means for the plant
2. Immediate treatment recommendations
3. Prevention strategies
4. Timeline for recovery
5. Any additional care tips
"""

    messages.append({"role": "user", "content": user_content})
    
    response = openrouter_client.chat_completion(messages, temperature=0.3)

    if response and "choices" in response and response["choices"]:
        return response["choices"][0]["message"]["content"]

    return (
        "I'm unable to reach the advisory service right now. "
        "Please retry later or contact a local agricultural extension office. "
        "In the meantime, ensure your plant has proper watering, good air circulation, "
        "and remove any visibly diseased leaves to prevent spread."
    )


__all__ = ["OpenRouterChat", "openrouter_client", "class_info_dict", "chatbot"]