from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
import os
import uuid
from datetime import datetime

# Import our modules
from scripts.inference import inference, get_disease_info
from scripts.chat import chatbot, class_info_dict, openrouter_client
from scripts.database import db  # ✅ Supabase only
from scripts.location_service import get_user_ip, get_location_from_ip, validate_coordinates
from scripts.analytics import export_analytics_data, get_disease_heatmap_data, get_top_diseases_by_location

app = Flask(__name__)
CORS(app)

# Global variables to store current detection session
current_detection = {
    'labels': [],
    'classes': {},
    'detection_id': None,
    'location_data': None
}

def save_uploaded_image(image_data):
    """Save uploaded image to disk and return the path"""
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join('uploads', filename)
    cv2.imwrite(filepath, image_data)
    return filepath

def get_location_data(request):
    """Get location data from request (coordinates or IP-based)"""
    location_data = None
    data = request.get_json(silent=True) or {}

    lat = request.form.get('latitude') or data.get('latitude')
    lon = request.form.get('longitude') or data.get('longitude')

    if lat and lon:
        is_valid, lat, lon = validate_coordinates(lat, lon)
        if is_valid:
            location_data = {'latitude': lat, 'longitude': lon, 'source': 'coordinates'}

    if not location_data:
        user_ip = get_user_ip(request)
        if user_ip and user_ip not in ['127.0.0.1', 'localhost']:
            ip_location = get_location_from_ip(user_ip)
            if ip_location:
                location_data = {
                    'latitude': ip_location['latitude'],
                    'longitude': ip_location['longitude'],
                    'location_name': ip_location['location_name'],
                    'source': 'ip'
                }
    return location_data

def detect_disease(image):
    """Run disease detection on the image"""
    try:
        inference_image, classes, namesInfer = inference(image)
        disease_info = get_disease_info(classes, namesInfer)

        # ✅ Ensure labels are extracted safely from namesInfer
        if isinstance(namesInfer, list) and all(isinstance(item, dict) for item in namesInfer):
            labels = list({item["class_id"] for item in namesInfer})
        else:
            labels = list(set(namesInfer))

        label = ", ".join([str(classes.get(label_id, "Unknown")) for label_id in labels])

        global current_detection
        current_detection['labels'] = labels
        current_detection['classes'] = classes
        return inference_image, label, disease_info
    except Exception as e:
        print(f"Error in disease detection: {e}")
        return image, "Detection failed", []

@app.route('/upload', methods=['POST'])
def upload():
    """Handle image upload and disease detection"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        in_memory_file = io.BytesIO()
        file.save(in_memory_file)
        data = np.frombuffer(in_memory_file.getvalue(), dtype=np.uint8)
        img = cv2.imdecode(data, 1)

        location_data = get_location_data(request)
        current_detection['location_data'] = location_data

        detected_image, label, disease_info = detect_disease(img)
        image_path = save_uploaded_image(detected_image)

        # ✅ Save detection to Supabase
        detection_id = db.save_detection(
            image_path=image_path,
            detected_diseases=label,
            latitude=location_data['latitude'] if location_data else None,
            longitude=location_data['longitude'] if location_data else None,
            location_name=location_data.get('location_name') if location_data else None,
            user_ip=get_user_ip(request)
        )
        current_detection['detection_id'] = detection_id

        _, img_encoded = cv2.imencode('.jpg', detected_image)
        image_as_text = base64.b64encode(img_encoded).decode('utf-8')

        return jsonify({
            'image': image_as_text,
            'label': label,
            'disease_info': disease_info,
            'detection_id': detection_id,
            'location': location_data
        })
    except Exception as e:
        print(f"Error in upload endpoint: {e}")
        return jsonify({'error': 'Failed to process the image'}), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        if not request.json or 'message' not in request.json:
            return jsonify({'error': 'No message provided'}), 400

        data = request.get_json()
        user_message = data['message']
        chat_history = data.get('chatHistory', [])

        info = ""
        if current_detection['labels'] and current_detection['classes']:
            for i, label_id in enumerate(current_detection['labels']):
                name = str(current_detection['classes'].get(label_id, "Unknown"))
                info_current = str(class_info_dict.get(name, "No information available"))
                info += f"{name}: {info_current}"
                if i < len(current_detection['labels']) - 1:
                    info += ", "
        else:
            info = "No disease information available. Please upload an image first."

        bot_response = chatbot(info, chat_history, user_message)

        # ✅ Save chat log in Supabase
        if current_detection['detection_id']:
            db.save_chat_log(
                detection_id=current_detection['detection_id'],
                user_message=user_message,
                bot_response=bot_response
            )

        return jsonify({'response': bot_response, 'detection_id': current_detection['detection_id']})
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': 'Failed to process chat request'}), 500

@app.route('/analytics', methods=['GET'])
def analytics():
    """Get comprehensive analytics data"""
    try:
        analytics_data = export_analytics_data()
        return jsonify(analytics_data)
    except Exception as e:
        print(f"Error in analytics endpoint: {e}")
        return jsonify({'error': 'Failed to get analytics data'}), 500

@app.route('/heatmap', methods=['GET'])
def heatmap():
    """Get heatmap data for disease distribution"""
    try:
        heatmap_data = get_disease_heatmap_data()
        return jsonify({'heatmap_data': heatmap_data})
    except Exception as e:
        print(f"Error in heatmap endpoint: {e}")
        return jsonify({'error': 'Failed to get heatmap data'}), 500

@app.route('/disease-by-location', methods=['GET'])
def disease_by_location():
    """Get disease distribution by location"""
    try:
        location_diseases = get_top_diseases_by_location()
        return jsonify({'location_diseases': location_diseases})
    except Exception as e:
        print(f"Error in disease-by-location endpoint: {e}")
        return jsonify({'error': 'Failed to get location disease data'}), 500

@app.route('/recent-detections', methods=['GET'])
def recent_detections():
    """Get recent detections"""
    try:
        limit = request.args.get('limit', 10, type=int)
        recent = db.get_recent_detections(limit)  # ✅ Supabase version
        return jsonify({'recent_detections': recent})
    except Exception as e:
        print(f"Error in recent-detections endpoint: {e}")
        return jsonify({'error': 'Failed to get recent detections'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat(), 'version': '1.0.0'})

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    if not os.path.exists('assets'):
        os.makedirs('assets')

    print("Starting Plant Disease Detection API with Supabase...")
    print("Make sure 'assets/best.pt' model file exists")
    print("OpenRouter API configured for expert chat")
    print("Available endpoints:")
    print("  POST /upload - Upload image for disease detection")
    print("  POST /chat - Chat with the farming expert")
    print("  GET /analytics - Get comprehensive analytics")
    print("  GET /heatmap - Get disease heatmap data")
    print("  GET /disease-by-location - Get disease distribution by location")
    print("  GET /recent-detections - Get recent detections")
    print("  GET /health - Health check")

    app.run(debug=True, host='0.0.0.0', port=5000)
