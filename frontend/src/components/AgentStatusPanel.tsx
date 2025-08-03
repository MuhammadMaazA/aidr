import React from 'react'
import { useStore } from '../state/store'

const AgentStatusPanel: React.FC = () => {
  const { agentStatuses } = useStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'processing':
      case 'analyzing':
        return 'status-active'
      case 'error':
        return 'status-error'
      case 'completed':
      case 'waiting':
        return 'status-indicator'
      default:
        return 'status-idle'
    }
  }

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'social_media':
        return '📱'
      case 'damage_assessment':
        return '🔍'
      case 'resource_planning':
        return '📦'
      default:
        return '🤖'
    }
  }

  const getAgentName = (agentType: string) => {
    switch (agentType) {
      case 'social_media':
        return 'Social Media Monitor'
      case 'damage_assessment':
        return 'Damage Assessment'
      case 'resource_planning':
        return 'Resource Planning'
      default:
        return agentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (Object.keys(agentStatuses).length === 0) {
    return (
      <div className="card">
        <h3 style={{ margin: '0 0 16px 0' }}>🤖 AI Agents</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          No agents are currently active. Start the backend agents to see their status here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0' }}>🤖 AI Agents</h3>
      
      {Object.values(agentStatuses).map((agent) => (
        <div key={agent.agent_type} className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>
                {getAgentIcon(agent.agent_type)}
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {getAgentName(agent.agent_type)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div className={`status-indicator ${getStatusColor(agent.status)}`} />
              <span style={{ 
                fontSize: '12px', 
                color: '#94a3b8',
                textTransform: 'capitalize'
              }}>
                {agent.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '14px',
            color: '#e2e8f0',
            marginBottom: '8px'
          }}>
            {agent.message}
          </div>

          <div style={{
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            Last update: {formatTime(agent.last_update)}
          </div>

          {agent.data && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(agent.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AgentStatusPanel