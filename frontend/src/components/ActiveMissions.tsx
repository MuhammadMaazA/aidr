import React from 'react';
import { useEmergencyStore } from '../state/emergencyStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  PlayIcon, 
  MapPinIcon, 
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ActiveMissions: React.FC = () => {
  const { activeMissions, resources } = useEmergencyStore();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const missionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - missionTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'rescue': return '🚁';
      case 'firefighting': return '🚒';
      case 'medical_assistance': return '🚑';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-status-pending/20 text-status-pending';
      case 'in_progress': return 'bg-emergency-info/20 text-emergency-info';
      case 'completed': return 'bg-status-active/20 text-status-active';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getAssignedResource = (resourceId?: string) => {
    if (!resourceId) return null;
    return resources.find(r => r.id === resourceId);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PlayIcon className="w-5 h-5" />
          Active Operations
          <Badge variant="secondary" className="ml-auto">
            {activeMissions.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 p-4">
            {activeMissions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <PlayIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active missions</p>
                <p className="text-sm">Deploy resources to begin operations</p>
              </div>
            ) : (
              activeMissions.map((mission) => {
                const assignedResource = getAssignedResource(mission.assignedResourceId);
                return (
                  <Card key={mission.id} className="border-l-4 border-l-emergency-success">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getMissionIcon(mission.type)}</span>
                          <h4 className="font-semibold capitalize">
                            {mission.type.replace('_', ' ')}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(mission.status)}>
                            {mission.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {mission.approvalTimestamp && formatTimeAgo(mission.approvalTimestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPinIcon className="w-4 h-4" />
                        <span>
                          {mission.targetLocation.lat.toFixed(6)}, {mission.targetLocation.lng.toFixed(6)}
                        </span>
                      </div>

                      {assignedResource && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserGroupIcon className="w-4 h-4" />
                              <span className="font-medium text-sm">{assignedResource.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {assignedResource.capabilities.personnel} personnel
                              </Badge>
                              <Badge className={getStatusColor(assignedResource.status)}>
                                {assignedResource.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          {assignedResource.capabilities.equipment.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Equipment: {assignedResource.capabilities.equipment.join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Priority: {mission.priority}/10
                        </div>
                        {mission.status === 'completed' && (
                          <div className="flex items-center gap-1 text-status-active text-sm">
                            <CheckCircleIcon className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActiveMissions;