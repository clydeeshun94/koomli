'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

// Mock data for analytics (in real app, this would come from API)
const generateAnalyticsData = () => {
  // Disease prevalence data
  const diseaseData = [
    { name: 'Apple Scab Leaf', count: 145, color: '#ef4444' },
    { name: 'Tomato Early blight', count: 132, color: '#3b82f6' },
    { name: 'Corn leaf blight', count: 98, color: '#22c55e' },
    { name: 'Potato early blight', count: 87, color: '#ec4899' },
    { name: 'Bell pepper spot', count: 76, color: '#f59e0b' },
    { name: 'Apple rust leaf', count: 65, color: '#f97316' },
    { name: 'Corn Gray spot', count: 54, color: '#eab308' },
    { name: 'Tomato Septoria', count: 43, color: '#8b5cf6' }
  ]

  // Regional distribution data
  const regionalData = [
    { region: 'Greater Accra', diseases: 234, detections: 156 },
    { region: 'Ashanti', diseases: 198, detections: 142 },
    { region: 'Eastern', diseases: 176, detections: 128 },
    { region: 'Western', diseases: 165, detections: 119 },
    { region: 'Central', diseases: 154, detections: 98 },
    { region: 'Northern', diseases: 143, detections: 87 },
    { region: 'Volta', diseases: 132, detections: 76 },
    { region: 'Bono', diseases: 121, detections: 65 }
  ]

  // Time series data (last 30 days)
  const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      detections: Math.floor(Math.random() * 20) + 5,
      uniqueDiseases: Math.floor(Math.random() * 8) + 2
    }
  })

  // Monthly trends
  const monthlyTrends = [
    { month: 'Jan', detections: 320, diseases: 12 },
    { month: 'Feb', detections: 280, diseases: 11 },
    { month: 'Mar', detections: 450, diseases: 15 },
    { month: 'Apr', detections: 520, diseases: 16 },
    { month: 'May', detections: 680, diseases: 18 },
    { month: 'Jun', detections: 720, diseases: 19 },
    { month: 'Jul', detections: 650, diseases: 17 },
    { month: 'Aug', detections: 590, diseases: 16 },
    { month: 'Sep', detections: 480, diseases: 14 },
    { month: 'Oct', detections: 420, diseases: 13 },
    { month: 'Nov', detections: 380, diseases: 12 },
    { month: 'Dec', detections: 340, diseases: 11 }
  ]

  // Severity index data
  const severityData = [
    { disease: 'Apple Scab Leaf', severity: 89, trend: 'up' },
    { disease: 'Tomato Early blight', severity: 76, trend: 'up' },
    { disease: 'Corn leaf blight', severity: 65, trend: 'stable' },
    { disease: 'Potato early blight', severity: 58, trend: 'down' },
    { disease: 'Bell pepper spot', severity: 45, trend: 'up' },
    { disease: 'Apple rust leaf', severity: 38, trend: 'stable' }
  ]

  return {
    diseaseData,
    regionalData,
    timeSeriesData,
    monthlyTrends,
    severityData
  }
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedTimeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // In real app, this would be:
      // const response = await fetch(`http://localhost:5000/analytics?range=${selectedTimeRange}`)
      // const data = await response.json()
      
      // For demo, we'll use generated data
      setTimeout(() => {
        const data = generateAnalyticsData()
        setAnalyticsData(data)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setLoading(false)
    }
  }

  const getSeverityIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
      default:
        return <Activity className="w-4 h-4 text-yellow-500" />
    }
  }

  const getSeverityBadge = (severity: number) => {
    if (severity >= 70) return <Badge variant="destructive">High</Badge>
    if (severity >= 40) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Disease Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into plant disease patterns and trends</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
            >
              {range}
            </Button>
          ))}
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Detections</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">+12% from last period</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Diseases</p>
                <p className="text-2xl font-bold">18</p>
                <p className="text-xs text-yellow-600">+2 new this month</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regions Affected</p>
                <p className="text-2xl font-bold">16</p>
                <p className="text-xs text-blue-600">All regions covered</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Severity</p>
                <p className="text-2xl font-bold">62%</p>
                <p className="text-xs text-red-600">+5% from last month</p>
              </div>
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disease Prevalence Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Disease Prevalence</CardTitle>
            <CardDescription>Most commonly detected plant diseases</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.diseaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Disease detection by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="detections" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="diseases" stackId="1" stroke="#10b981" fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Series */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Trends</CardTitle>
            <CardDescription>Daily detection patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="detections" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="uniqueDiseases" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Year-long disease detection patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="detections" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Severity Index and Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disease Severity Index */}
        <Card>
          <CardHeader>
            <CardTitle>Disease Severity Index</CardTitle>
            <CardDescription>Current severity levels and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analyticsData.severityData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(item.trend)}
                      <div>
                        <p className="font-medium text-sm">{item.disease}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${item.severity}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{item.severity}%</span>
                        </div>
                      </div>
                    </div>
                    {getSeverityBadge(item.severity)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Recommendations</CardTitle>
            <CardDescription>Important insights and suggested actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-red-800">High Alert</p>
                      <p className="text-xs text-red-600">Apple Scab Leaf severity increased by 15% in Ashanti region</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-yellow-800">Monitoring Required</p>
                      <p className="text-xs text-yellow-600">Tomato diseases showing upward trend in Greater Accra</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-800">Positive Trend</p>
                      <p className="text-xs text-green-600">Potato early blight decreasing in Western region</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-800">Seasonal Alert</p>
                      <p className="text-xs text-blue-600">Expect increased corn diseases with upcoming rainy season</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}