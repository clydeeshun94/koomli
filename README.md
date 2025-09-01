# Koomli Disease Detection AI System

A comprehensive AI-powered system for detecting plant diseases from images, providing expert advice, and tracking disease distribution geographically with a focus on Ghana.

## 🌟 Features

### 📱 **Frontend Features**
- **Image Upload & Camera Capture**: Upload images or take real-time photos of plants
- **Speech-to-Text & Text-to-Speech**: Voice interaction for accessibility
- **Interactive Disease Map**: Visual representation of disease prevalence across Ghana
- **Expert Chat Interface**: AI-powered farming expert using DeepSeek API
- **Analytics Dashboard**: Comprehensive charts and statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🔧 **Backend Features**
- **YOLO Disease Detection**: Advanced AI model for plant disease identification
- **Location Tracking**: Automatic IP-based and manual coordinate location
- **DeepSeek Integration**: Free API for expert agricultural advice
- **Database Storage**: SQLite database for all detections and interactions
- **Analytics Engine**: Real-time statistics and trend analysis
- **RESTful API**: Clean and well-documented endpoints

### 🗺️ **Disease Map Features**
- **Interactive Ghana Map**: Detailed visualization of all 16 regions
- **Color-Coded Diseases**: 5 different colors representing different disease types
- **Proportional Circles**: Circle size directly proportional to disease prevalence
- **Real-time Updates**: Live data refresh and regional filtering
- **Detailed Tooltips**: Hover information for each region and disease

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- Your trained YOLO model (`best.pt`)

### **1. Clone and Setup**
```bash
git clone <your-repo-url>
cd plant-disease-detection
```

### **2. Frontend Setup**
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### **3. Model Setup**
Place your trained YOLO model in the project root:
```bash
# Copy your best.pt file to the assets directory
mkdir -p assets
cp your-best.pt assets/best.pt
```

### **4. API Configuration**
Update the DeepSeek API key in `scripts/chat.py`:
```python
DEEPSEEK_API_KEY = 'your-deepseek-api-key-here'
```

### **5. Run the Application**

**Option A: Run Frontend and Backend Separately**
```bash
# Terminal 1 - Start Next.js frontend
npm run dev

# Terminal 2 - Start Flask backend
python app.py
```

**Option B: Run Both Simultaneously**
```bash
# This will run both frontend and backend
npm run dev:full
```

### **6. Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Application Structure

```
plant-disease-detection/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx           # App layout
│   │   └── globals.css          # Global styles
│   └── components/
│       ├── DiseaseMap.tsx       # Interactive Ghana map
│       ├── ChatInterface.tsx    # Expert chat system
│       └── AnalyticsDashboard.tsx # Analytics and charts
├── scripts/
│   ├── database.py             # Database operations
│   ├── chat.py                 # DeepSeek chat integration
│   ├── inference.py            # YOLO model inference
│   ├── location_service.py     # Geolocation services
│   └── analytics.py            # Analytics engine
├── assets/
│   └── best.pt                 # Your YOLO model
├── app.py                      # Flask API server
├── requirements.txt            # Python dependencies
└── package.json               # Node.js dependencies
```

## 🗺️ Disease Map Details

### **Ghana Regions Covered**
The interactive map includes all 16 regions of Ghana:
- Greater Accra, Ashanti, Eastern, Western, Central
- Northern, Upper East, Upper West, Volta
- Bono, Bono East, Ahafo, North East
- Savannah, Oti, Western North

### **Disease Color Coding**
- **Red**: Apple Scab Leaf, Tomato leaf late blight
- **Orange**: Apple rust leaf, Corn rust leaf
- **Yellow**: Corn Gray leaf spot, Bell pepper spot
- **Green**: Corn leaf blight, Potato early blight
- **Blue**: Tomato Early blight, Tomato Septoria spot

### **Circle Size Logic**
Circle diameter is directly proportional to disease prevalence:
- **Small circles** (1-30% prevalence): 5-15km radius
- **Medium circles** (31-60% prevalence): 15-30km radius
- **Large circles** (61-100% prevalence): 30-50km radius

## 🔌 API Endpoints

### **Core Endpoints**
- `POST /upload` - Upload image for disease detection
- `POST /chat` - Chat with expert bot
- `GET /health` - System health check

### **Analytics Endpoints**
- `GET /analytics` - Comprehensive analytics data
- `GET /heatmap` - Disease heatmap data
- `GET /disease-by-location` - Regional disease data
- `GET /recent-detections` - Recent detection history

### **Request Examples**

**Image Upload:**
```bash
curl -X POST -F "file=@plant_image.jpg" \
  -F "latitude=5.5560" \
  -F "longitude=-0.1969" \
  http://localhost:5000/upload
```

**Chat Interaction:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"message":"What treatment for apple scab?","chatHistory":[]}' \
  http://localhost:5000/chat
```

## 🎨 Frontend Components

### **Main Interface**
- **Detection Tab**: Image upload, camera capture, results display
- **Map Tab**: Interactive disease map of Ghana
- **Chat Tab**: Expert consultation interface
- **Analytics Tab**: Comprehensive statistics and trends

### **Voice Features**
- **Speech-to-Text**: Click microphone button to speak questions
- **Text-to-Speech**: Automatic reading of responses and results
- **Voice Feedback**: Visual indicators for voice activity

### **Accessibility Features**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: Clear visual indicators
- **Responsive Design**: Mobile-friendly interface

## 📈 Analytics Features

### **Available Charts**
- **Disease Prevalence**: Bar chart of most common diseases
- **Regional Distribution**: Area chart by geographic region
- **Time Series**: Line chart of detection trends
- **Monthly Overview**: Year-long pattern analysis

### **Key Metrics**
- Total detections count
- Unique diseases identified
- Regions affected
- Average severity index

### **Alert System**
- High severity alerts
- Trend notifications
- Seasonal warnings
- Regional recommendations

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory:
```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your-api-key-here

# Optional: External services
GOOGLE_MAPS_API_KEY=your-maps-key (for enhanced maps)
WEATHER_API_KEY=your-weather-key (for weather correlation)
```

### **Model Configuration**
Update YOLO model settings in `scripts/inference.py`:
```python
CONFIDENCE_THRESHOLD = 0.4  # Adjust detection confidence
MODEL_PATH = 'assets/best.pt'  # Model file path
```

## 🧪 Testing

### **Frontend Testing**
```bash
# Run linting
npm run lint

# Build application
npm run build
```

### **Backend Testing**
```bash
# Test database initialization
python scripts/database.py

# Test chat functionality
python scripts/chat.py

# Test analytics
python scripts/analytics.py
```

## 🚀 Deployment

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Backend Deployment**
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production settings
export FLASK_ENV=production
python app.py
```

### **Docker Deployment**
```dockerfile
# Dockerfile example
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **YOLOv8** for the object detection framework
- **DeepSeek** for providing the AI chat API
- **Leaflet** for the interactive mapping capabilities
- **React** and **Next.js** for the frontend framework
- **Flask** for the backend API framework

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the documentation** in this README
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed description
4. **Contact the development team** for urgent matters

### **Common Issues**

**Model Not Found**
```
Error: Model file not found at assets/best.pt
```
**Solution**: Place your trained YOLO model in the `assets/` directory.

**API Key Error**
```
Error: DeepSeek API authentication failed
```
**Solution**: Update your API key in `scripts/chat.py`.

**Camera Permission Denied**
```
Error: Unable to access camera
```
**Solution**: Check browser permissions and ensure HTTPS connection.

**Map Not Loading**
```
Error: Leaflet tiles not loading
```
**Solution**: Check internet connection and CORS settings.

---

🌱 **Happy Plant Disease Detection!** 🌱