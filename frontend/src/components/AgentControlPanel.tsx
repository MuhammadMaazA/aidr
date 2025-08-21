import React, { useState } from 'react'
import { useStore } from '../state/store'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

const AgentControlPanel: React.FC = () => {
  const { agentStatuses } = useStore()
  const [isStarting, setIsStarting] = useState<string | null>(null)

  const agents = [
    {
      type: 'social_media',
      name: 'Social Media Monitor',
      icon: '📱',
      description: 'Scans social media for disaster reports',
      sequence: 1
    },
    {
      type: 'damage_assessment',
      name: 'Damage Assessment',
      icon: '🔍',
      description: 'Analyzes damage reports and creates tasks',
      sequence: 2
    },
    {
      type: 'resource_planning',
      name: 'Resource Planning',
      icon: '📦',
      description: 'Allocates resources to emergency tasks',
      sequence: 3
    }
  ]

  const getAgentStatus = (agentType: string) => {
    const status = agentStatuses[agentType]
    if (!status) return 'idle'
    return status.status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'processing':
      case 'analyzing':
        return '#10b981' // Green
      case 'error':
        return '#ef4444' // Red
      case 'completed':
        return '#3b82f6' // Blue
      case 'waiting':
        return '#f59e0b' // Orange
      case 'starting':
        return '#8b5cf6' // Purple
      default:
        return '#64748b' // Gray
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'processing':
      case 'analyzing':
        return '🟢'
      case 'error':
        return '🔴'
      case 'completed':
        return '✅'
      case 'waiting':
        return '🟡'
      case 'starting':
        return '🟣'
      default:
        return '⚪'
    }
  }

  const startAgent = async (agentType: string) => {
    try {
      setIsStarting(agentType)
      console.log(`Starting agent: ${agentType}`)
      
      const response = await axios.post(`${API_BASE}/agents/start/${agentType}`)
      console.log('Agent started successfully:', response.data)
      
      // Optionally show a success message or update UI
      alert(`${agentType.replace('_', ' ').toUpperCase()} agent started successfully!`)
      
    } catch (error) {
      console.error('Failed to start agent:', error)
      
      // Show error details
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data)
        alert(`Failed to start agent: ${error.response?.data?.detail || error.message}`)
      } else {
        alert(`Failed to start agent: ${error}`)
      }
    } finally {
      setIsStarting(null)
    }
  }

  const canStartAgent = (agentType: string, sequence: number) => {
    const status = getAgentStatus(agentType)
    
    // Agent is already running
    if (['active', 'processing', 'analyzing', 'starting'].includes(status)) {
      return false
    }
    
    // For first agent (social media), always allow
    if (sequence === 1) return true
    
    // For subsequent agents, check if previous agents have completed
    const previousAgents = agents.filter(a => a.sequence < sequence)
    return previousAgents.every(a => {
      const prevStatus = getAgentStatus(a.type)
      return ['completed', 'waiting'].includes(prevStatus)
    })
  }

  const getButtonText = (agentType: string, sequence: number) => {
    const status = getAgentStatus(agentType)
    
    if (isStarting === agentType) return 'Starting...'
    if (['active', 'processing', 'analyzing'].includes(status)) return 'Running'
    if (status === 'completed') return 'Completed'
    if (status === 'waiting') return 'Waiting'
    if (status === 'error') return 'Error - Retry'
    
    if (!canStartAgent(agentType, sequence)) {
      return sequence === 1 ? 'Start Monitoring' : 'Waiting for Prerequisites'
    }
    
    return sequence === 1 ? 'Start Monitoring' : `Run ${agents.find(a => a.type === agentType)?.name}`
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0' }}>🎛️ Agent Control Center</h3>
      
      <div style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
        Follow the sequence: Monitor → Assess → Plan
      </div>
      
      {agents.map((agent) => {
        const status = getAgentStatus(agent.type)
        const canStart = canStartAgent(agent.type, agent.sequence)
        const isRunning = ['active', 'processing', 'analyzing', 'starting'].includes(status)
        
        return (
          <div key={agent.type} className="card" style={{
            border: `1px solid ${getStatusColor(status)}40`,
            borderLeft: `4px solid ${getStatusColor(status)}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>{agent.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>
                    {agent.sequence}. {agent.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {agent.description}
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '12px' }}>
                  {getStatusIcon(status)}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: getStatusColor(status),
                  textTransform: 'capitalize',
                  fontWeight: 'bold'
                }}>
                  {status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {agentStatuses[agent.type]?.message && (
              <div style={{
                fontSize: '12px',
                color: '#e2e8f0',
                marginBottom: '8px',
                padding: '4px 8px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '4px'
              }}>
                {agentStatuses[agent.type].message}
              </div>
            )}

            <button
              className="button"
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                width: '100%',
                backgroundColor: canStart && !isRunning ? '#3b82f6' : '#64748b',
                cursor: canStart && !isRunning ? 'pointer' : 'not-allowed',
                opacity: canStart && !isRunning ? 1 : 0.6
              }}
              onClick={() => {
                console.log(`Button clicked for ${agent.type}, canStart: ${canStart}, isRunning: ${isRunning}`)
                if (canStart && !isRunning) {
                  startAgent(agent.type)
                }
              }}
              disabled={!canStart || isRunning || isStarting === agent.type}
            >
              {getButtonText(agent.type, agent.sequence)}
            </button>
          </div>
        )
      })}
      
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        💡 Tip: Run agents in sequence for optimal results
      </div>
    </div>
  )
}

export default AgentControlPanel
