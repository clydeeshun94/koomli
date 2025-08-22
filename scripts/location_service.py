from __future__ import annotations

from typing import Any, Dict, Optional

import requests
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError


def get_location_from_ip(ip_address: str) -> Optional[Dict[str, Any]]:
    """Use ip-api.com to resolve an IP to lat/lon/city."""
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                return {
                    "latitude": data.get("lat"),
                    "longitude": data.get("lon"),
                    "location_name": f"{data.get('city')}, {data.get('country')}",
                    "country": data.get("country"),
                    "region": data.get("regionName"),
                    "city": data.get("city"),
                }
    except Exception as e:
        print(f"[location] IP lookup error: {e}")
    return None


def get_location_from_coordinates(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Reverse geocode coordinates to a readable address."""
    try:
        geolocator = Nominatim(user_agent="plant_disease_detector")
        location = geolocator.reverse((lat, lon), language="en", timeout=10)
        if location:
            return {
                "location_name": location.address,
                "country": location.raw.get("address", {}).get("country", ""),
                "region": location.raw.get("address", {}).get("state", ""),
                "city": location.raw.get("address", {}).get("city", ""),
            }
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"[location] Geocoding error: {e}")
    except Exception as e:
        print(f"[location] Reverse geocode error: {e}")
    return None


def get_user_ip(request) -> Optional[str]:
    """Extract client IP from Flask request."""
    if request.headers.getlist("X-Forwarded-For"):
        return request.headers.getlist("X-Forwarded-For")[0]
    return request.remote_addr


def validate_coordinates(lat: Any, lon: Any):
    """Validate lat/lon are numeric and in range."""
    try:
        lat_f = float(lat)
        lon_f = float(lon)
        if -90 <= lat_f <= 90 and -180 <= lon_f <= 180:
            return True, lat_f, lon_f
        return False, None, None
    except (ValueError, TypeError):
        return False, None, None


if __name__ == "__main__":
    print(get_location_from_ip("8.8.8.8"))
