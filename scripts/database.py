# ===============================================
# File: database.py
# ===============================================
from __future__ import annotations

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import os

from supabase import Client, create_client
from dotenv import load_dotenv

load_dotenv()


TABLE_DETECTIONS = "detections"
TABLE_CHATS = "chats"


@dataclass
class DetectionRecord:
    """Lightweight container for a single request's persisted detection."""
    id: Optional[int]
    image_path: Optional[str]
    detected_diseases: Any  # jsonb in Supabase: list[dict] or list[str]
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: Optional[str]
    user_ip: Optional[str]
    timestamp: Optional[datetime]


class SupabaseDatabase:
    """Thin Supabase wrapper for reads/writes used by the app."""

    def __init__(self) -> None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in environment.")
        self.supabase: Client = create_client(url, key)

    # ---------- Writes ----------
    def save_detection(
        self,
        image_path: Optional[str],
        detected_diseases: Any,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        location_name: Optional[str] = None,
        user_ip: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> Optional[int]:
        payload = {
            "image_path": image_path,
            "detected_diseases": detected_diseases,
            "latitude": latitude,
            "longitude": longitude,
            "location_name": location_name,
            "user_ip": user_ip,
            "timestamp": (timestamp or datetime.utcnow()).isoformat(),
        }
        try:
            res = self.supabase.table(TABLE_DETECTIONS).insert(payload).execute()
            return (res.data or [{}])[0].get("id")
        except Exception as e:
            print(f"[db] Failed to save detection: {e}")
            return None

    def save_chat_log(self, user_message: str, bot_response: str, timestamp: Optional[datetime] = None) -> Optional[int]:
        payload = {
            "user_message": user_message,
            "bot_response": bot_response,
            "timestamp": (timestamp or datetime.utcnow()).isoformat(),
        }
        try:
            res = self.supabase.table(TABLE_CHATS).insert(payload).execute()
            return (res.data or [{}])[0].get("id")
        except Exception as e:
            print(f"[db] Failed to save chat log: {e}")
            return None

    # ---------- Reads ----------
    def fetch_detections(
        self,
        since: Optional[datetime] = None,
        fields: str = "id,timestamp,location_name,latitude,longitude,detected_diseases",
        limit: int = 10000,
    ) -> List[DetectionRecord]:
        q = self.supabase.table(TABLE_DETECTIONS).select(fields).limit(limit).order("timestamp", desc=True)
        if since:
            q = q.gte("timestamp", since.isoformat())
        res = q.execute()
        rows = res.data or []
        out: List[DetectionRecord] = []
        for r in rows:
            ts = r.get("timestamp")
            try:
                ts = datetime.fromisoformat(ts) if ts else None
            except Exception:
                pass
            out.append(
                DetectionRecord(
                    id=r.get("id"),
                    image_path=r.get("image_path"),
                    detected_diseases=r.get("detected_diseases"),
                    latitude=r.get("latitude"),
                    longitude=r.get("longitude"),
                    location_name=r.get("location_name"),
                    user_ip=r.get("user_ip"),
                    timestamp=ts,
                )
            )
        return out


# Singleton used by other modules
db = SupabaseDatabase()
