from __future__ import annotations

from typing import Any, Dict, List, Optional
import os
import json
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()


class DeepSeekChat:
    def __init__(self, api_key: Optional[str], model_name: str = "deepseek-chat") -> None:
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://api.deepseek.com/v1"

    def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.3) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            print("[deepseek] Missing DEEPSEEK_API_KEY; returning None.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
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
            print(f"[deepseek] API error {resp.status_code}: {resp.text[:200]}")
            return None
        except Exception as e:
            print(f"[deepseek] Request error: {e}")
            return None


DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
deepseek_client = DeepSeekChat(DEEPSEEK_API_KEY)


# Load class info from assets JSON
ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
CLASS_INFO_PATH = ASSETS_DIR / "class_info.json"

class_info_dict: Dict[str, str] = {}
try:
    with open(CLASS_INFO_PATH, "r", encoding="utf-8") as f:
        class_info_dict = json.load(f)
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"[deepseek] Warning: could not load {CLASS_INFO_PATH}: {e}")


def chatbot(info: str, history: List[Any], message: str) -> str:
    """
    Chatbot function using DeepSeek API with farming-expert persona.
    """
    messages: List[Dict[str, str]] = [
        {
            "role": "system",
            "content": (
                "You are a farming expert with specialized knowledge in plant diseases. "
                "A farmer comes to you with the name of a specific plant disease and some basic information about it. "
                "Your job is to guide the farmer with practical, actionable advice."
            ),
        }
    ]

    if history:
        for entry in history:
            if isinstance(entry, dict):
                if entry.get("user"):
                    messages.append({"role": "user", "content": entry["user"]})
                if entry.get("bot"):
                    messages.append({"role": "assistant", "content": entry["bot"]})
            else:
                messages.append({"role": "user", "content": str(entry)})

    messages.append({"role": "user", "content": f"Information about the disease: {info}\n\nUser question: {message}"})
    response = deepseek_client.chat_completion(messages, temperature=0.3)

    if response and "choices" in response and response["choices"]:
        return response["choices"][0]["message"]["content"]

    return (
        "I'm unable to reach the advisory service right now. "
        "Please retry later or contact a local agricultural extension office."
    )


__all__ = ["DeepSeekChat", "deepseek_client", "class_info_dict", "chatbot"]
