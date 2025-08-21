import { create } from 'zustand';

export interface Incident {
  id: string;
  source: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  rawContent: string;
  extractedData: {
    incidentType: string;
    locationString: string;
    estimatedCasualties?: number;
    urgency: number;
    isVerifiedSource: boolean;
  };
  status: 'unverified' | 'verified' | 'addressed';
}

export interface Resource {
  id: string;
  name: string;
  type: 'medical' | 'fire' | 'search_and_rescue' | 'police';
  currentLocation: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'en_route' | 'on_site' | 'unavailable';
  capabilities: {
    personnel: number;
    equipment: string[];
  };
}

export interface Mission {
  id: string;
  type: 'rescue' | 'firefighting' | 'medical_assistance';
  targetLocation: {
    lat: number;
    lng: number;
  };
  status: 'recommended' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority: number;
  assignedResourceId?: string;
  recommendationReason: string;
  creationTimestamp: string;
  approvalTimestamp?: string;
}

export interface DamageArea {
  id: string;
  area: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  damageLevel: number;
  assessmentTimestamp: string;
  contributingIncidents: string[];
}

interface EmergencyState {
  incidents: Incident[];
  resources: Resource[];
  missionRecommendations: Mission[];
  activeMissions: Mission[];
  damageAreas: DamageArea[];
  webSocketStatus: 'connected' | 'disconnected' | 'connecting';
  
  // Actions
  addIncident: (incident: Incident) => void;
  updateResource: (resource: Resource) => void;
  addMissionRecommendation: (mission: Mission) => void;
  approveMission: (missionId: string, resourceId: string) => void;
  rejectMission: (missionId: string) => void;
  updateDamageAreas: (areas: DamageArea[]) => void;
  setWebSocketStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  incidents: [],
  resources: [],
  missionRecommendations: [],
  activeMissions: [],
  damageAreas: [],
  webSocketStatus: 'disconnected',

  addIncident: (incident) => 
    set((state) => ({ 
      incidents: [incident, ...state.incidents] 
    })),

  updateResource: (resource) =>
    set((state) => ({
      resources: state.resources.map(r => 
        r.id === resource.id ? resource : r
      )
    })),

  addMissionRecommendation: (mission) =>
    set((state) => ({
      missionRecommendations: [mission, ...state.missionRecommendations]
    })),

  approveMission: (missionId, resourceId) =>
    set((state) => {
      const mission = state.missionRecommendations.find(m => m.id === missionId);
      if (mission) {
        const approvedMission = {
          ...mission,
          status: 'approved' as const,
          assignedResourceId: resourceId,
          approvalTimestamp: new Date().toISOString()
        };
        return {
          missionRecommendations: state.missionRecommendations.filter(m => m.id !== missionId),
          activeMissions: [approvedMission, ...state.activeMissions]
        };
      }
      return state;
    }),

  rejectMission: (missionId) =>
    set((state) => ({
      missionRecommendations: state.missionRecommendations.filter(m => m.id !== missionId)
    })),

  updateDamageAreas: (areas) =>
    set({ damageAreas: areas }),

  setWebSocketStatus: (status) =>
    set({ webSocketStatus: status })
}));