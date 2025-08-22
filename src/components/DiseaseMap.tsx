'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, Tooltip } from 'react-leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, RefreshCw, Info } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Ghana bounds and regions data
const GHANA_CENTER = [7.9465, -1.0232] as [number, number]
const GHANA_REGIONS = [
  { name: 'Greater Accra', center: [5.5560, -0.1969], diseases: ['Tomato Early blight leaf', 'Corn leaf blight'] },
  { name: 'Ashanti', center: [6.6885, -1.6244], diseases: ['Apple Scab Leaf', 'Potato leaf early blight'] },
  { name: 'Eastern', center: [6.3410, -0.2535], diseases: ['Tomato Septoria leaf spot', 'Corn Gray leaf spot'] },
  { name: 'Western', center: [4.8773, -2.0967], diseases: ['Bell_pepper leaf spot', 'Squash Powdery mildew leaf'] },
  { name: 'Central', center: [5.0993, -1.2834], diseases: ['Apple rust leaf', 'Tomato leaf bacterial spot'] },
  { name: 'Northern', center: [9.4067, -0.8373], diseases: ['Corn rust leaf', 'Potato leaf late blight'] },
  { name: 'Upper East', center: [10.7455, -0.3589], diseases: ['Tomato leaf late blight', 'Tomato leaf mosaic virus'] },
  { name: 'Upper West', center: [10.0833, -2.5000], diseases: ['Tomato leaf yellow virus', 'Tomato mold leaf'] },
  { name: 'Volta', center: [6.5833, 0.7833], diseases: ['Tomato two spotted spider mites leaf', 'Grape leaf black rot'] },
  { name: 'Bono', center: [7.3417, -2.3333], diseases: ['Apple Scab Leaf', 'Corn leaf blight'] },
  { name: 'Bono East', center: [7.7000, -1.1667], diseases: ['Tomato Early blight leaf', 'Potato leaf early blight'] },
  { name: 'Ahafo', center: [6.9333, -2.5000], diseases: ['Apple rust leaf', 'Corn Gray leaf spot'] },
  { name: 'North East', center: [10.3167, -0.3667], diseases: ['Corn rust leaf', 'Tomato leaf bacterial spot'] },
  { name: 'Savannah', center: [9.7500, -1.5000], diseases: ['Potato leaf late blight', 'Squash Powdery mildew leaf'] },
  { name: 'Oti', center: [8.2500, 0.4167], diseases: ['Tomato leaf mosaic virus', 'Grape leaf black rot'] },
  { name: 'Western North', center: [6.2500, -2.7500], diseases: ['Bell_pepper leaf spot', 'Tomato leaf yellow virus'] }
]

// Disease colors for visualization
const DISEASE_COLORS = {
  'Apple Scab Leaf': '#ef4444',
  'Apple rust leaf': '#f97316',
  'Corn Gray leaf spot': '#eab308',
  'Corn leaf blight': '#22c55e',
  'Tomato Early blight leaf': '#3b82f6',
  'Tomato Septoria leaf spot': '#8b5cf6',
  'Potato leaf early blight': '#ec4899',
  'Potato leaf late blight': '#14b8a6',
  'Bell_pepper leaf spot': '#f59e0b',
  'Squash Powdery mildew leaf': '#06b6d4',
  'Tomato leaf bacterial spot': '#84cc16',
  'Tomato leaf late blight': '#f43f5e',
  'Tomato leaf mosaic virus': '#a855f7',
  'Tomato leaf yellow virus': '#0ea5e9',
  'Tomato mold leaf': '#10b981',
  'Tomato two spotted spider mites leaf': '#f97316',
  'Grape leaf black rot': '#dc2626',
  'Corn rust leaf': '#eab308'
}

// Simulated disease prevalence data (in real app, this would come from API)
const generateDiseaseData = () => {
  return GHANA_REGIONS.map(region => {
    const diseaseData = region.diseases.map(disease => ({
      name: disease,
      prevalence: Math.floor(Math.random() * 100) + 1, // Random prevalence 1-100
      color: DISEASE_COLORS[disease as keyof typeof DISEASE_COLORS] || '#6b7280'
    }))
    
    return {
      ...region,
      diseases: diseaseData
    }
  })
}

export default function DiseaseMap() {
  const [diseaseData, setDiseaseData] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to get disease data
    const fetchDiseaseData = async () => {
      setLoading(true)
      try {
        // In real app, this would be:
        // const response = await fetch('http://localhost:5000/analytics')
        // const data = await response.json()
        
        // For demo, we'll use generated data
        const data = generateDiseaseData()
        setDiseaseData(data)
      } catch (error) {
        console.error('Error fetching disease data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDiseaseData()
  }, [])

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      const data = generateDiseaseData()
      setDiseaseData(data)
      setLoading(false)
    }, 1000)
  }

  const getRegionData = (regionName: string) => {
    return diseaseData.find(region => region.name === regionName)
  }

  const getTopDiseases = () => {
    const diseaseCounts: { [key: string]: { count: number, regions: string[] } } = {}
    
    diseaseData.forEach(region => {
      region.diseases.forEach((disease: any) => {
        if (!diseaseCounts[disease.name]) {
          diseaseCounts[disease.name] = { count: 0, regions: [] }
        }
        diseaseCounts[disease.name].count += disease.prevalence
        diseaseCounts[disease.name].regions.push(region.name)
      })
    })

    return Object.entries(diseaseCounts)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading disease map data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Map Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ghana Disease Distribution Map
              </div>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Interactive map showing disease prevalence across Ghana. Circle size represents disease prevalence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={GHANA_CENTER}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {diseaseData.map((region) => (
                  region.diseases.map((disease: any, index: number) => (
                    <Circle
                      key={`${region.name}-${disease.name}`}
                      center={region.center as [number, number]}
                      radius={disease.prevalence * 500} // Scale radius based on prevalence
                      pathOptions={{
                        color: disease.color,
                        fillColor: disease.color,
                        fillOpacity: 0.6,
                        weight: 2
                      }}
                      eventHandlers={{
                        click: () => setSelectedRegion(region.name)
                      }}
                    >
                      <Tooltip>
                        <div className="text-sm">
                          <strong>{region.name}</strong><br />
                          {disease.name}: {disease.prevalence}% prevalence
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold mb-2">{region.name}</h3>
                          <div className="space-y-1">
                            {region.diseases.map((d: any) => (
                              <div key={d.name} className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: d.color }}
                                />
                                <span className="text-sm">{d.name}: {d.prevalence}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </Circle>
                  ))
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disease Statistics Sidebar */}
      <div className="space-y-6">
        {/* Top Diseases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Top Diseases
            </CardTitle>
            <CardDescription>
              Most prevalent diseases across Ghana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {getTopDiseases().map((disease, index) => (
                  <div key={disease.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: DISEASE_COLORS[disease.name as keyof typeof DISEASE_COLORS] }}
                      />
                      <span className="font-medium text-sm">{disease.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {disease.count}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Region Details */}
        {selectedRegion && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedRegion} Region</CardTitle>
              <CardDescription>
                Disease breakdown for this region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {getRegionData(selectedRegion)?.diseases.map((disease: any) => (
                    <div key={disease.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: disease.color }}
                        />
                        <span className="text-sm">{disease.name}</span>
                      </div>
                      <Badge variant="outline">
                        {disease.prevalence}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Disease Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {Object.entries(DISEASE_COLORS).map(([disease, color]) => (
                  <div key={disease} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs">{disease}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}