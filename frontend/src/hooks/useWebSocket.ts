import { useEffect, useRef } from 'react';
import { useEmergencyStore } from '../state/emergencyStore';

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { 
    addIncident, 
    updateResource, 
    addMissionRecommendation, 
    updateDamageAreas, 
    setWebSocketStatus 
  } = useEmergencyStore();

  const connect = () => {
    try {
      setWebSocketStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setWebSocketStatus('connected');
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.event_type) {
            case 'NEW_INCIDENT':
              addIncident(message.payload);
              break;
            case 'RESOURCE_UPDATE':
              updateResource(message.payload);
              break;
            case 'NEW_RECOMMENDATION':
              addMissionRecommendation(message.payload);
              break;
            case 'MAP_UPDATE':
              updateDamageAreas(message.payload);
              break;
            default:
              console.log('Unknown message type:', message.event_type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setWebSocketStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds if it wasn't a clean close
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWebSocketStatus('disconnected');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setWebSocketStatus('disconnected');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close(1000, 'Component unmounting');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [url]);

  return {
    disconnect,
    reconnect: connect
  };
};