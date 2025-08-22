from __future__ import annotations

from typing import Any, Dict, List, Tuple, Union
import os

import numpy as np
from ultralytics import YOLO


def _to_image_array(image: Union[str, np.ndarray]) -> np.ndarray:
    """Return a numpy image for safe fallback plotting."""
    if isinstance(image, np.ndarray):
        return image
    # Why: if image is a path and something fails, we still need a shaped array for graceful fallback.
    try:
        import cv2  # optional
        arr = cv2.imread(image)
        if arr is not None:
            return arr
    except Exception:
        pass
    return np.zeros((512, 512, 3), dtype=np.uint8)


def inference(image: Union[str, np.ndarray]) -> Tuple[np.ndarray, Dict[int, str], List[Dict[str, Any]]]:
    """
    Run YOLO inference and return (annotated_image, classes_map, detections).
    detections: [{class_id, class_name, confidence, bbox:[x1,y1,x2,y2]}]
    """
    model_path = "assets/best.pt"
    base_image = _to_image_array(image)

    try:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")

        model = YOLO(model_path)
        results = model(image, conf=0.25)  # lower conf to avoid 'no results' in borderline cases

        annotated = base_image
        classes: Dict[int, str] = {}
        detections: List[Dict[str, Any]] = []

        for r in results:
            annotated = r.plot()
            classes = r.names or {}
            cls_list = r.boxes.cls.tolist() if r.boxes and r.boxes.cls is not None else []
            conf_list = r.boxes.conf.tolist() if r.boxes and r.boxes.conf is not None else []
            xyxy = r.boxes.xyxy.tolist() if r.boxes and r.boxes.xyxy is not None else []

            for cls_id, conf, box in zip(cls_list, conf_list, xyxy):
                cls_i = int(cls_id)
                detections.append(
                    {
                        "class_id": cls_i,
                        "class_name": classes.get(cls_i, "Unknown"),
                        "confidence": float(conf),
                        "bbox": [float(v) for v in box],
                    }
                )

        return annotated, classes, detections

    except Exception as e:
        print(f"[inference] Error: {e}")
        return base_image, {}, []


def get_disease_info(classes: Dict[int, str], detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Map detections to a simpler disease info list.
    """
    info: List[Dict[str, Any]] = []
    for det in detections:
        cls_id = det.get("class_id")
        info.append(
            {
                "class_id": cls_id,
                "class_name": classes.get(cls_id, det.get("class_name", "Unknown")),
                "confidence": det.get("confidence"),
            }
        )
    return info


if __name__ == "__main__":
    print("Inference module ready. Ensure 'assets/best.pt' exists.")