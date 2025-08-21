import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEmergencyStore } from '../state/emergencyStore';

// For demo purposes - replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVtbyIsImEiOiJjazJ0dGZ6MTcwM3VoM29tbGxrMGdoMmwwIn0.AQNHyAYDgYmBc_prgB6vVw';

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { incidents, resources, damageAreas } = useEmergencyStore();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.006, 40.7128], // NYC coordinates for demo
      zoom: 12,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Update incident markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing incident markers
    const existingMarkers = document.querySelectorAll('.incident-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add incident markers
    incidents.forEach(incident => {
      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${getIncidentColor(incident.extractedData.urgency)};
        border: 2px solid rgba(255, 255, 255, 0.8);
        cursor: pointer;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
      `;

      const popup = new mapboxgl.Popup({ offset: 15 })
        .setHTML(`
          <div class="p-3 bg-card text-card-foreground rounded-lg border border-border">
            <h3 class="font-semibold text-sm mb-1">${incident.extractedData.incidentType}</h3>
            <p class="text-xs text-muted-foreground mb-2">${incident.extractedData.locationString}</p>
            <p class="text-xs">${incident.rawContent}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emergency-critical/20 text-emergency-critical">
                Urgency: ${incident.extractedData.urgency}/5
              </span>
              ${incident.extractedData.isVerifiedSource ? 
                '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emergency-success/20 text-emergency-success">Verified</span>' : 
                '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emergency-warning/20 text-emergency-warning">Unverified</span>'
              }
            </div>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [incidents]);

  // Update resource markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing resource markers
    const existingResourceMarkers = document.querySelectorAll('.resource-marker');
    existingResourceMarkers.forEach(marker => marker.remove());

    // Add resource markers
    resources.forEach(resource => {
      const el = document.createElement('div');
      el.className = 'resource-marker';
      el.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 3px;
        background-color: ${getResourceColor(resource.status)};
        border: 2px solid rgba(255, 255, 255, 0.9);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
      `;
      el.textContent = getResourceIcon(resource.type);

      const popup = new mapboxgl.Popup({ offset: 15 })
        .setHTML(`
          <div class="p-3 bg-card text-card-foreground rounded-lg border border-border">
            <h3 class="font-semibold text-sm mb-1">${resource.name}</h3>
            <p class="text-xs text-muted-foreground mb-2">${resource.type}</p>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResourceStatusClass(resource.status)}">
                ${resource.status}
              </span>
              <span class="text-xs text-muted-foreground">${resource.capabilities.personnel} personnel</span>
            </div>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([resource.currentLocation.lng, resource.currentLocation.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [resources]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
        <h3 className="font-semibold text-sm mb-2">Live Situational Awareness</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emergency-critical"></div>
            <span>High Priority Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-active"></div>
            <span>Available Resources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-pending"></div>
            <span>Deployed Resources</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getIncidentColor = (urgency: number): string => {
  if (urgency >= 4) return 'hsl(var(--emergency-critical))';
  if (urgency >= 3) return 'hsl(var(--emergency-warning))';
  return 'hsl(var(--emergency-info))';
};

const getResourceColor = (status: string): string => {
  switch (status) {
    case 'available': return 'hsl(var(--status-active))';
    case 'en_route': case 'on_site': return 'hsl(var(--status-pending))';
    default: return 'hsl(var(--status-inactive))';
  }
};

const getResourceIcon = (type: string): string => {
  switch (type) {
    case 'medical': return '🚑';
    case 'fire': return '🚒';
    case 'police': return '🚓';
    case 'search_and_rescue': return '🚁';
    default: return '📋';
  }
};

const getResourceStatusClass = (status: string): string => {
  switch (status) {
    case 'available': return 'bg-status-active/20 text-status-active';
    case 'en_route': return 'bg-status-pending/20 text-status-pending';
    case 'on_site': return 'bg-emergency-info/20 text-emergency-info';
    default: return 'bg-status-inactive/20 text-status-inactive';
  }
};

export default MapView;