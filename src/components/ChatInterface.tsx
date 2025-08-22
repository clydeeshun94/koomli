'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Send, 
  Mic, 
  Volume2, 
  Bot, 
  User,
  Leaf,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  detectionId: string | null
  onSpeak: (text: string) => void
  isSpeaking: boolean
}

export default function ChatInterface({ detectionId, onSpeak, isSpeaking }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your plant disease expert assistant. Upload an image of your plant, and I'll help you understand any diseases detected and provide expert advice on treatment and prevention.",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'
        recognitionRef.current = recognitionInstance
      }
    }

    // Listen for speech-to-text events
    const handleSpeechToText = (event: CustomEvent) => {
      setInputMessage(event.detail)
    }
    window.addEventListener('speechToText', handleSpeechToText as EventListener)

    return () => {
      window.removeEventListener('speechToText', handleSpeechToText as EventListener)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      recognitionRef.current.start()
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chatHistory: messages.map(msg => ({
            user: msg.type === 'user' ? msg.content : '',
            bot: msg.type === 'bot' ? msg.content : ''
          }))
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        
        // Auto-speak the response
        setTimeout(() => {
          onSpeak(data.response)
        }, 500)
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again later or consult with a local agricultural extension service for immediate assistance.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const speakMessage = (message: string) => {
    if (!isSpeaking) {
      onSpeak(message)
    }
  }

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ))
  }

  const getQuickActions = () => {
    if (!detectionId) {
      return [
        "How do I prevent plant diseases?",
        "What are common tomato diseases?",
        "How to improve plant health?"
      ]
    }
    
    return [
      "What treatment do you recommend?",
      "How can I prevent this disease?",
      "Is this disease harmful to humans?",
      "What are the early symptoms?",
      "How long until recovery?"
    ]
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat Main Area */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Expert Plant Disease Chat
            </CardTitle>
            <CardDescription>
              Chat with our AI farming expert for personalized advice
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">
                        {formatMessage(message.content)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.type === 'bot' && (
                          <Button
                            onClick={() => speakMessage(message.content)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
            
            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about plant diseases, treatments, or prevention..."
                  className="flex-1 resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={startListening}
                    disabled={isListening || isLoading}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0"
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="h-10 w-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {getQuickActions().map((action, index) => (
                  <Button
                    key={index}
                    onClick={() => setInputMessage(action)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Detection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Detection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detectionId ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Image analyzed</span>
                </div>
                <div className="text-xs text-gray-500">
                  Detection ID: {detectionId}
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Ready for expert advice
                </Badge>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">No image uploaded</span>
                </div>
                <p className="text-xs text-gray-500">
                  Upload a plant image to get personalized disease analysis and treatment recommendations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-gray-600">
              <p>• Be specific about your plant type</p>
              <p>• Mention any symptoms you've observed</p>
              <p>• Ask about prevention methods</p>
              <p>• Inquire about organic treatments</p>
              <p>• Describe environmental conditions</p>
            </div>
          </CardContent>
        </Card>

        {/* Voice Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Voice Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Speech-to-text:</span>
                <Badge variant={isListening ? "default" : "secondary"} className="text-xs">
                  {isListening ? "Active" : "Ready"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Text-to-speech:</span>
                <Badge variant={isSpeaking ? "default" : "secondary"} className="text-xs">
                  {isSpeaking ? "Speaking" : "Ready"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}