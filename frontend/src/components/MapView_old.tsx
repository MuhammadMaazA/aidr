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
      center: [-74.006, 40.7128], // NYC
      zoom: 11,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      // Add 3D buildings layer
      map.current!.addLayer({
        id: 'add-3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add incident markers
  useEffect(() => {
    if (!map.current || !incidents.length) return;

    // Remove existing incident markers
    const existingMarkers = document.querySelectorAll('.incident-marker');
    existingMarkers.forEach(marker => marker.remove());

    incidents.forEach((incident) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'incident-marker';
      markerEl.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${getIncidentColor(incident.extractedData.urgency)};
        border: 2px solid white;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="color: black; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
            ${incident.extractedData.incidentType.toUpperCase()}
          </h3>
          <p style="margin: 0 0 4px 0; font-size: 12px;">
            ${incident.extractedData.locationString}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">
            Urgency: ${incident.extractedData.urgency}/5
          </p>
          <p style="margin: 0; font-size: 11px; color: #666;">
            Source: ${incident.source}
          </p>
        </div>
      `);

      new mapboxgl.Marker(markerEl)
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [incidents]);

  // Add resource markers
  useEffect(() => {
    if (!map.current || !resources.length) return;

    // Remove existing resource markers
    const existingMarkers = document.querySelectorAll('.resource-marker');
    existingMarkers.forEach(marker => marker.remove());

    resources.forEach((resource) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'resource-marker';
      markerEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 3px;
        background-color: ${getResourceColor(resource.status)};
        border: 1px solid white;
        cursor: pointer;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      `;

      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="color: black; padding: 8px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold;">
            ${resource.name}
          </h4>
          <p style="margin: 0 0 3px 0; font-size: 11px;">
            Type: ${resource.type}
          </p>
          <p style="margin: 0 0 3px 0; font-size: 11px;">
            Status: ${resource.status}
          </p>
          <p style="margin: 0; font-size: 11px;">
            Personnel: ${resource.capabilities.personnel}
          </p>
        </div>
      `);

      new mapboxgl.Marker(markerEl)
        .setLngLat([resource.currentLocation.lng, resource.currentLocation.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [resources]);

  // Add damage areas
  useEffect(() => {
    if (!map.current || !damageAreas.length) return;

    damageAreas.forEach((area, index) => {
      const sourceId = `damage-area-${index}`;
      const layerId = `damage-area-layer-${index}`;

      if (map.current!.getSource(sourceId)) {
        map.current!.removeLayer(layerId);
        map.current!.removeSource(sourceId);
      }

      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: area.area,
          properties: {
            damageLevel: area.damageLevel
          }
        }
      });

      map.current!.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': getDamageColor(area.damageLevel),
          'fill-opacity': 0.3
        }
      });
    });
  }, [damageAreas]);

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 text-sm">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emergency-critical"></div>
            <span>High Priority Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emergency-warning"></div>
            <span>Medium Priority Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emergency-info"></div>
            <span>Low Priority Incidents</span>
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
    case 'en_route': return 'hsl(var(--status-pending))';
    case 'on_site': return 'hsl(var(--status-pending))';
    default: return 'hsl(var(--status-inactive))';
  }
};

const getDamageColor = (level: number): string => {
  if (level >= 0.8) return '#dc2626'; // High damage - red
  if (level >= 0.5) return '#ea580c'; // Medium damage - orange
  return '#eab308'; // Low damage - yellow
};

export default MapView;
