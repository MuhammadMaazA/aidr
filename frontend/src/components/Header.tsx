import React from 'react'
import { useStore } from '../state/store'

const Header: React.FC = () => {
  const { selectedDisaster, agentStatuses, websocket } = useStore()

  const getConnectionStatus = () => {
    return websocket ? 'Connected' : 'Disconnected'
  }

  const getActiveAgents = () => {
    return Object.values(agentStatuses).filter(agent => 
      agent.status === 'active' || agent.status === 'processing'
    ).length
  }

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      padding: '16px 24px',
      borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚀 Project AIDR
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            Agent-driven Integrated Disaster Response
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          {selectedDisaster && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(51, 65, 85, 0.5)'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Event</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {selectedDisaster.name}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Severity: {selectedDisaster.severity}/10
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div
                className={`status-indicator ${websocket ? 'status-active' : 'status-error'}`}
              />
              <span style={{ fontSize: '14px' }}>
                {getConnectionStatus()}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '14px' }}>
                Agents: {getActiveAgents()}/{Object.keys(agentStatuses).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header