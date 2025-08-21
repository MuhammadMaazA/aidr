import React, { useEffect } from 'react';
import MapView from './MapView';
import IncidentFeed from './IncidentFeed';
import MissionControl from './MissionControl';
import ActiveMissions from './ActiveMissions';
import { useEmergencyStore } from '../state/emergencyStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  SignalIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { 
    incidents, 
    resources, 
    missionRecommendations, 
    activeMissions, 
    webSocketStatus,
    addIncident,
    updateResource,
    addMissionRecommendation
  } = useEmergencyStore();

  // Initialize with demo data
  useEffect(() => {
    // Demo incidents
    const demoIncidents = [
      {
        id: '1',
        source: 'social_media',
        location: { lat: 40.7589, lng: -73.9851 },
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        rawContent: 'Major fire on 42nd Street! Smoke everywhere, need help urgently! #emergency',
        extractedData: {
          incidentType: 'fire',
          locationString: '42nd Street, Times Square',
          estimatedCasualties: 0,
          urgency: 5,
          isVerifiedSource: false
        },
        status: 'unverified' as const
      },
      {
        id: '2',
        source: 'field_report',
        location: { lat: 40.7505, lng: -73.9934 },
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        rawContent: 'Building collapse at construction site. Multiple people trapped. Requesting immediate rescue teams.',
        extractedData: {
          incidentType: 'building_collapse',
          locationString: 'Construction Site, Penn Station Area',
          estimatedCasualties: 3,
          urgency: 5,
          isVerifiedSource: true
        },
        status: 'verified' as const
      },
      {
        id: '3',
        source: 'social_media',
        location: { lat: 40.7282, lng: -74.0776 },
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        rawContent: 'Medical emergency in subway station. Person collapsed, paramedics needed',
        extractedData: {
          incidentType: 'medical_emergency',
          locationString: 'World Trade Center Subway Station',
          estimatedCasualties: 1,
          urgency: 3,
          isVerifiedSource: false
        },
        status: 'unverified' as const
      }
    ];

    // Demo resources
    const demoResources = [
      {
        id: 'res1',
        name: 'Fire Engine 7',
        type: 'fire' as const,
        currentLocation: { lat: 40.7614, lng: -73.9776 },
        status: 'available' as const,
        capabilities: {
          personnel: 6,
          equipment: ['ladder', 'hose', 'breathing_apparatus']
        }
      },
      {
        id: 'res2',
        name: 'Medical Team Alpha',
        type: 'medical' as const,
        currentLocation: { lat: 40.7505, lng: -73.9934 },
        status: 'en_route' as const,
        capabilities: {
          personnel: 4,
          equipment: ['stretcher', 'defibrillator', 'medical_kit']
        }
      },
      {
        id: 'res3',
        name: 'Search & Rescue Unit 3',
        type: 'search_and_rescue' as const,
        currentLocation: { lat: 40.7128, lng: -74.0060 },
        status: 'available' as const,
        capabilities: {
          personnel: 8,
          equipment: ['cutting_tools', 'lifting_equipment', 'detection_devices']
        }
      },
      {
        id: 'res4',
        name: 'Police Unit 12',
        type: 'police' as const,
        currentLocation: { lat: 40.7282, lng: -74.0776 },
        status: 'on_site' as const,
        capabilities: {
          personnel: 2,
          equipment: ['crowd_control', 'communication']
        }
      }
    ];

    // Demo mission recommendation
    const demoMission = {
      id: 'mission1',
      type: 'rescue' as const,
      targetLocation: { lat: 40.7505, lng: -73.9934 },
      status: 'recommended' as const,
      priority: 9,
      recommendationReason: 'High-priority rescue mission needed at construction site. Building collapse with confirmed casualties. Immediate deployment of Search & Rescue Unit recommended.',
      creationTimestamp: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
    };

    // Add demo data to store
    demoIncidents.forEach(incident => addIncident(incident));
    demoResources.forEach(resource => updateResource(resource));
    addMissionRecommendation(demoMission);
  }, [addIncident, updateResource, addMissionRecommendation]);

  // For demo - simulate WebSocket connection
  // In production, this would be: useWebSocket('ws://localhost:8000/ws/updates');
  useEffect(() => {
    // Simulate periodic new incidents
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const newIncident = {
          id: `incident_${Date.now()}`,
          source: Math.random() > 0.5 ? 'social_media' : 'field_report',
          location: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
          },
          timestamp: new Date().toISOString(),
          rawContent: 'New emergency situation detected by AI monitoring system',
          extractedData: {
            incidentType: ['fire', 'medical_emergency', 'traffic_accident'][Math.floor(Math.random() * 3)],
            locationString: 'Auto-detected location',
            urgency: Math.floor(Math.random() * 5) + 1,
            isVerifiedSource: Math.random() > 0.5
          },
          status: 'unverified' as const
        };
        addIncident(newIncident);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [addIncident]);

  const getStatusColor = () => {
    switch (webSocketStatus) {
      case 'connected': return 'bg-status-active text-status-active';
      case 'connecting': return 'bg-status-pending text-status-pending';
      default: return 'bg-status-inactive text-status-inactive';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Project AIDR</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Emergency Response Command Center
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <SignalIcon className="w-4 h-4" />
              <span>System Status:</span>
              <Badge className={`${getStatusColor()}/20`}>
                {webSocketStatus === 'connected' ? 'Live' : webSocketStatus}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-6 py-4 bg-muted/20">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-emergency-critical" />
              <div>
                <p className="text-2xl font-bold">{incidents.length}</p>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-status-active" />
              <div>
                <p className="text-2xl font-bold">{resources.filter(r => r.status === 'available').length}</p>
                <p className="text-sm text-muted-foreground">Available Resources</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <RocketLaunchIcon className="w-8 h-8 text-emergency-warning" />
              <div>
                <p className="text-2xl font-bold">{missionRecommendations.length}</p>
                <p className="text-sm text-muted-foreground">Pending Missions</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-emergency-info" />
              <div>
                <p className="text-2xl font-bold">{activeMissions.length}</p>
                <p className="text-sm text-muted-foreground">Active Operations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="p-6 grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">
        {/* Map View - Takes up most space */}
        <div className="col-span-7">
          <MapView />
        </div>
        
        {/* Right Panel */}
        <div className="col-span-5 space-y-6">
          {/* Incident Feed */}
          <div className="h-1/2">
            <IncidentFeed />
          </div>
          
          {/* Mission Control and Active Missions */}
          <div className="h-1/2 grid grid-cols-2 gap-4">
            <MissionControl />
            <ActiveMissions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;