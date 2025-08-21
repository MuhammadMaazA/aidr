import React from 'react';
import { useEmergencyStore } from '../state/emergencyStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const IncidentFeed: React.FC = () => {
  const { incidents } = useEmergencyStore();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const incidentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - incidentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 4) return 'bg-emergency-critical/20 text-emergency-critical';
    if (urgency >= 3) return 'bg-emergency-warning/20 text-emergency-warning';
    return 'bg-emergency-info/20 text-emergency-info';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-4 h-4 text-emergency-success" />;
      case 'addressed':
        return <CheckCircleIcon className="w-4 h-4 text-status-active" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-emergency-warning" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Live Incident Feed
          <Badge variant="secondary" className="ml-auto">
            {incidents.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 p-4">
            {incidents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No incidents reported yet</p>
                <p className="text-sm">System monitoring for emergency reports...</p>
              </div>
            ) : (
              incidents.map((incident, index) => (
                <div
                  key={incident.id}
                  className={`border rounded-lg p-4 bg-card transition-all duration-300 ${
                    index === 0 ? 'ring-2 ring-primary/20 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <h4 className="font-semibold text-sm capitalize">
                        {incident.extractedData.incidentType.replace('_', ' ')}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(incident.extractedData.urgency)}>
                        Priority {incident.extractedData.urgency}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(incident.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {incident.extractedData.locationString}
                  </p>
                  
                  <p className="text-sm mb-3">
                    {incident.rawContent}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        Source: {incident.source}
                      </span>
                      {incident.extractedData.estimatedCasualties && (
                        <span className="text-emergency-critical">
                          🚨 {incident.extractedData.estimatedCasualties} casualties reported
                        </span>
                      )}
                    </div>
                    <Badge 
                      variant={incident.extractedData.isVerifiedSource ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {incident.extractedData.isVerifiedSource ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default IncidentFeed;