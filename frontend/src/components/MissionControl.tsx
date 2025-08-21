import React, { useState } from 'react';
import { useEmergencyStore } from '../state/emergencyStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  RocketLaunchIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MissionControl: React.FC = () => {
  const { missionRecommendations, resources, approveMission, rejectMission } = useEmergencyStore();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handleApprove = (missionId: string) => {
    setSelectedMission(missionId);
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (selectedMission && selectedResource) {
      approveMission(selectedMission, selectedResource);
      setIsApprovalModalOpen(false);
      setSelectedMission(null);
      setSelectedResource('');
    }
  };

  const handleReject = (missionId: string) => {
    rejectMission(missionId);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const missionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - missionTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-emergency-critical text-emergency-critical';
    if (priority >= 5) return 'bg-emergency-warning text-emergency-warning';
    return 'bg-emergency-info text-emergency-info';
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'rescue': return '🚁';
      case 'firefighting': return '🚒';
      case 'medical_assistance': return '🚑';
      default: return '📋';
    }
  };

  const availableResources = resources.filter(r => r.status === 'available');

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <RocketLaunchIcon className="w-5 h-5" />
            Mission Control
            <Badge variant="secondary" className="ml-auto">
              {missionRecommendations.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4 p-4">
              {missionRecommendations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <RocketLaunchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No mission recommendations</p>
                  <p className="text-sm">AI agents are analyzing the situation...</p>
                </div>
              ) : (
                missionRecommendations.map((mission) => (
                  <Card key={mission.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getMissionIcon(mission.type)}</span>
                          <h4 className="font-semibold capitalize">
                            {mission.type.replace('_', ' ')}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(mission.priority)}/20`}>
                            Priority {mission.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatTimeAgo(mission.creationTimestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPinIcon className="w-4 h-4" />
                        <span>
                          {mission.targetLocation.lat.toFixed(6)}, {mission.targetLocation.lng.toFixed(6)}
                        </span>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-emergency-warning mt-0.5" />
                          <div>
                            <p className="text-sm font-medium mb-1">AI Recommendation</p>
                            <p className="text-sm text-muted-foreground">
                              {mission.recommendationReason}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleApprove(mission.id)}
                          className="flex-1"
                          variant="default"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Approve & Deploy
                        </Button>
                        <Button
                          onClick={() => handleReject(mission.id)}
                          variant="destructive"
                          size="icon"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Mission</DialogTitle>
            <DialogDescription>
              Select a resource to assign to this mission. The selected resource will be deployed immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Available Resources</label>
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {availableResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center gap-2">
                        <span>{getMissionIcon(resource.type)}</span>
                        <span>{resource.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {resource.capabilities.personnel} personnel
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availableResources.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                <p>No available resources</p>
                <p className="text-sm">All resources are currently deployed</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleConfirmApproval}
                disabled={!selectedResource}
                className="flex-1"
              >
                Confirm Deployment
              </Button>
              <Button
                onClick={() => setIsApprovalModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MissionControl;