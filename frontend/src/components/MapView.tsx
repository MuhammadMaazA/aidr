import React, { useState } from 'react'
import Map, { NavigationControl, ScaleControl, Marker } from 'react-map-gl'
import { useStore } from '../state/store'

const MAPBOX_TOKEN = (import.meta as any).env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNraDZjM3k5ZzAwMnEycXBmYW1yNGMxbjEifQ.dummy_token'

const MapView: React.FC = () => {
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 12
  })

  const { damageReports, resources, tasks, selectedDisaster } = useStore()

  // Debug logging
  console.log('🗺️ MapView Debug Info:')
  console.log('MAPBOX_TOKEN:', MAPBOX_TOKEN)
  console.log('Token length:', MAPBOX_TOKEN?.length)
  console.log('Starts with pk.:', MAPBOX_TOKEN?.startsWith('pk.'))
  console.log('Damage Reports:', damageReports?.length || 0)
  console.log('Resources:', resources?.length || 0)
  console.log('Tasks:', tasks?.length || 0)
  console.log('Selected Disaster:', selectedDisaster?.name || 'None')

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Map Container */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />
        
        {/* Task Markers */}
        {tasks.map((task) => (
          <Marker
            key={`task-${task.id}`}
            longitude={task.longitude}
            latitude={task.latitude}
          >
            <div style={{
              background: task.status === 'pending' ? '#ef4444' : task.status === 'in_progress' ? '#f59e0b' : '#10b981',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              {task.task_type === 'rescue' ? '🚑' : '🔍'} P{task.priority}
            </div>
          </Marker>
        ))}
        
        {/* Resource Markers */}
        {resources.map((resource) => (
          <Marker
            key={`resource-${resource.id}`}
            longitude={resource.longitude}
            latitude={resource.latitude}
          >
            <div style={{
              background: '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '50%',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              {resource.resource_type === 'personnel' ? '👥' : resource.resource_type === 'medical' ? '🏥' : '🔧'}
            </div>
          </Marker>
        ))}
        
        {/* Damage Report Markers */}
        {damageReports.map((report) => (
          <Marker
            key={`report-${report.id}`}
            longitude={report.longitude}
            latitude={report.latitude}
          >
            <div style={{
              background: report.severity >= 7 ? '#dc2626' : report.severity >= 4 ? '#ea580c' : '#16a34a',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              cursor: 'pointer'
            }}>
              {report.damage_type === 'flood' ? '🌊' : report.damage_type === 'fire' ? '🔥' : '⚡'} {report.severity}
            </div>
          </Marker>
        ))}
      </Map>
      
      {/* Debug Info Overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Longitude: {viewState.longitude.toFixed(4)}</div>
        <div>Latitude: {viewState.latitude.toFixed(4)}</div>
        <div>Zoom: {viewState.zoom.toFixed(2)}</div>
        <div>Token: {MAPBOX_TOKEN ? 'Present' : 'Missing'}</div>
        <div>Token Valid: {MAPBOX_TOKEN?.startsWith('pk.') ? 'Yes' : 'No'}</div>
        <div>Damage Reports: {damageReports?.length || 0}</div>
        <div>Resources: {resources?.length || 0}</div>
        <div>Tasks: {tasks?.length || 0}</div>
        <div>Selected Disaster: {selectedDisaster?.name || 'None'}</div>
      </div>
    </div>
  )
}

export default MapView