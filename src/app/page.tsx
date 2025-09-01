'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Camera, 
  Upload, 
  MapPin, 
  Mic, 
  Volume2, 
  MessageSquare, 
  BarChart3,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'
import DiseaseMap from '@/components/DiseaseMap'
import ChatInterface from '@/components/ChatInterface'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [detectedDiseases, setDetectedDiseases] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [locationData, setLocationData] = useState<any>(null)
  const [detectionId, setDetectionId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Speech recognition setup
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'
        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        analyzeImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    if (!isCameraOpen) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraOpen(true)
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        alert('Unable to access camera. Please ensure camera permissions are granted.')
      }
    } else {
      capturePhoto()
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        setSelectedImage(imageData)
        analyzeImage(imageData)
        closeCamera()
      }
    }
  }

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsCameraOpen(false)
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      const formData = new FormData()
      formData.append('file', blob, 'image.jpg')

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            formData.append('latitude', position.coords.latitude.toString())
            formData.append('longitude', position.coords.longitude.toString())
          },
          (error) => {
            console.log('Geolocation error:', error)
          }
        )
      }

      // Send to backend
      const apiResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      })

      if (apiResponse.ok) {
        const result = await apiResponse.json()
        setDetectedDiseases(result.disease_info || [])
        setLocationData(result.location)
        setDetectionId(result.detection_id)
        setSelectedImage(`data:image/jpeg;base64,${result.image}`)
        
        // Speak results if speech is enabled
        if (result.label) {
          speakText(`I detected ${result.label} in your plant image.`)
        }
      } else {
        throw new Error('Failed to analyze image')
      }

      setAnalysisProgress(100)
    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        
        // Send transcript to chat
        const chatEvent = new CustomEvent('speechToText', { detail: transcript })
        window.dispatchEvent(chatEvent)
      }
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      recognition.start()
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && !isSpeaking) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const getDiseaseColor = (diseaseName: string) => {
    const colors: { [key: string]: string } = {
      'Apple Scab Leaf': '#ef4444',
      'Apple rust leaf': '#f97316',
      'Corn Gray leaf spot': '#eab308',
      'Corn leaf blight': '#22c55e',
      'Tomato Early blight leaf': '#3b82f6',
      'Tomato Septoria leaf spot': '#8b5cf6',
      'Potato leaf early blight': '#ec4899',
      'Potato leaf late blight': '#14b8a6',
      'Bell_pepper leaf spot': '#f59e0b',
      'Squash Powdery mildew leaf': '#06b6d4'
    }
    return colors[diseaseName] || '#6b7280'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center gap-2">
            <Leaf className="w-8 h-8" />
            Koomli Disease Detection AI
          </h1>
          <p className="text-gray-600">Upload or capture plant images to detect diseases and get expert advice</p>
        </div>

        <Tabs defaultValue="detection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="detection" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Disease Map
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Expert Chat
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Image Capture
                  </CardTitle>
                  <CardDescription>
                    Upload an image or capture a photo of your plant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button 
                      onClick={handleCameraCapture}
                      className="flex-1"
                      variant="outline"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isCameraOpen ? 'Capture Photo' : 'Use Camera'}
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Camera Preview */}
                  {isCameraOpen && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        onClick={closeCamera}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        Close
                      </Button>
                    </div>
                  )}

                  {/* Selected Image Preview */}
                  {selectedImage && !isCameraOpen && (
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected plant"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Analysis Progress */}
                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing image...</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full" />
                    </div>
                  )}

                  {/* Voice Controls */}
                  <div className="flex gap-2">
                    <Button
                      onClick={startListening}
                      disabled={isListening || !recognition}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Mic className={`w-4 h-4 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
                      {isListening ? 'Listening...' : 'Voice Input'}
                    </Button>
                    <Button
                      onClick={() => selectedImage && speakText('Image analysis complete. Check the results for detected diseases.')}
                      disabled={!selectedImage || isSpeaking}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Volume2 className={`w-4 h-4 mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      {isSpeaking ? 'Speaking...' : 'Read Results'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Detection Results
                  </CardTitle>
                  <CardDescription>
                    Analysis results and disease information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {detectedDiseases.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {detectedDiseases.map((disease, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{disease.class_name}</h3>
                              <Badge 
                                variant="secondary"
                                style={{ backgroundColor: getDiseaseColor(disease.class_name) }}
                              >
                                Detected
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Confidence: {((disease.confidence || 0.8) * 100).toFixed(1)}%</p>
                              {locationData && (
                                <p className="flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {locationData.location_name || 'Location detected'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {selectedImage ? 'No diseases detected' : 'Upload an image to begin analysis'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <DiseaseMap />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface 
              detectionId={detectionId}
              onSpeak={speakText}
              isSpeaking={isSpeaking}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Developed with ⚡ by{' '}
              <a 
                href="https://bigint.onrender.com/about#portfolio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Clyde at BigInt
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}