import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useStore } from '../state/store'

// You'll need to set your Mapbox token in .env.local
// VITE_MAPBOX_TOKEN=pk.your_token_here
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNraDZjM3k5ZzAwMnEycXBmYW1yNGMxbjEifQ.dummy_token'

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng, setLng] = useState(-74.006)
  const [lat, setLat] = useState(40.7128)
  const [zoom, setZoom] = useState(12)

  const { damageReports, resources, tasks, selectedDisaster } = useStore()

  useEffect(() => {
    if (map.current) return // Initialize map only once
    
    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme for disaster response
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right')

    // Update coordinates on move
    map.current.on('move', () => {
      if (map.current) {
        setLng(Number(map.current.getCenter().lng.toFixed(4)))
        setLat(Number(map.current.getCenter().lat.toFixed(4)))
        setZoom(Number(map.current.getZoom().toFixed(2)))
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [lng, lat, zoom])

  // Add damage reports as markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing damage report markers
    const existingMarkers = document.querySelectorAll('.damage-marker')
    existingMarkers.forEach(marker => marker.remove())

    damageReports.forEach((report) => {
      const getSeverityColor = (severity: number) => {
        if (severity >= 7) return '#ef4444'
        if (severity >= 4) return '#f59e0b'
        return '#10b981'
      }

      // Create marker element
      const el = document.createElement('div')
      el.className = 'damage-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = getSeverityColor(report.severity)
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="color: black; padding: 8px;">
            <strong>${report.damage_type.replace('_', ' ').toUpperCase()}</strong><br/>
            Severity: ${report.severity}/10<br/>
            Source: ${report.source.replace('_', ' ')}<br/>
            Confidence: ${(report.confidence * 100).toFixed(0)}%<br/>
            ${report.verified ? '<span style="color: green;">✓ Verified</span>' : '<span style="color: orange;">⚠ Unverified</span>'}
            ${report.description ? `<br/><br/>${report.description.substring(0, 100)}...` : ''}
          </div>
        `)

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(map.current!)
    })
  }, [damageReports])

  // Add resource markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing resource markers
    const existingMarkers = document.querySelectorAll('.resource-marker')
    existingMarkers.forEach(marker => marker.remove())

    resources.forEach((resource) => {
      const getResourceColor = (status: string) => {
        switch (status) {
          case 'available': return '#10b981'
          case 'deployed': return '#3b82f6'
          case 'maintenance': return '#6b7280'
          default: return '#64748b'
        }
      }

      const getResourceIcon = (type: string) => {
        switch (type) {
          case 'personnel': return '👥'
          case 'medical': return '🏥'
          case 'equipment': return '🚛'
          default: return '📦'
        }
      }

      // Create marker element
      const el = document.createElement('div')
      el.className = 'resource-marker'
      el.style.width = '30px'
      el.style.height = '30px'
      el.style.borderRadius = '4px'
      el.style.backgroundColor = getResourceColor(resource.status)
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.fontSize = '14px'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.innerHTML = getResourceIcon(resource.resource_type)

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="color: black; padding: 8px;">
            <strong>${resource.name}</strong><br/>
            Type: ${resource.resource_type}<br/>
            Status: ${resource.status}<br/>
            Capacity: ${resource.current_load}/${resource.capacity}<br/>
            Utilization: ${((resource.current_load / resource.capacity) * 100).toFixed(0)}%
          </div>
        `)

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([resource.longitude, resource.latitude])
        .setPopup(popup)
        .addTo(map.current!)
    })
  }, [resources])

  // Add task markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing task markers
    const existingMarkers = document.querySelectorAll('.task-marker')
    existingMarkers.forEach(marker => marker.remove())

    tasks.forEach((task) => {
      const getPriorityColor = (priority: number) => {
        if (priority >= 4) return '#ef4444'
        if (priority >= 3) return '#f59e0b'
        return '#10b981'
      }

      const getTaskIcon = (type: string) => {
        switch (type) {
          case 'rescue': return '🚑'
          case 'medical': return '🏥'
          case 'assessment': return '🔍'
          case 'logistics': return '📦'
          default: return '📋'
        }
      }

      // Only show pending and in-progress tasks
      if (task.status === 'completed') return

      // Create marker element
      const el = document.createElement('div')
      el.className = 'task-marker'
      el.style.width = '25px'
      el.style.height = '25px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = getPriorityColor(task.priority)
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.fontSize = '12px'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.innerHTML = getTaskIcon(task.task_type)

      // Add pulsing animation for high priority tasks
      if (task.priority >= 4) {
        el.style.animation = 'pulse 2s infinite'
      }

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="color: black; padding: 8px;">
            <strong>${task.title}</strong><br/>
            Type: ${task.task_type}<br/>
            Priority: ${task.priority}/5<br/>
            Status: ${task.status}<br/>
            ${task.estimated_duration ? `Duration: ${task.estimated_duration}min<br/>` : ''}
            ${task.description ? `<br/>${task.description.substring(0, 100)}...` : ''}
          </div>
        `)

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([task.longitude, task.latitude])
        .setPopup(popup)
        .addTo(map.current!)
    })
  }, [tasks])

  // Center map on selected disaster
  useEffect(() => {
    if (selectedDisaster && map.current) {
      map.current.flyTo({
        center: [selectedDisaster.longitude, selectedDisaster.latitude],
        zoom: 14,
        duration: 2000
      })
    }
  }, [selectedDisaster])

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Map Info Overlay */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        backdropFilter: 'blur(10px)',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <div>Longitude: {lng}</div>
        <div>Latitude: {lat}</div>
        <div>Zoom: {zoom}</div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        backdropFilter: 'blur(10px)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Map Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
          <span>High Severity Damage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Medium Severity Damage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
          <span>Low Severity Damage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#3b82f6' }} />
          <span>Resources</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Active Tasks</span>
        </div>
      </div>

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  )
}

export default MapView