import React, { useState } from 'react'
import { useStore } from '../state/store'
import AgentStatusPanel from './AgentStatusPanel'
import TaskQueue from './TaskQueue'
import DamageReports from './DamageReports'

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'tasks' | 'reports'>('agents')

  const tabs = [
    { id: 'agents', label: 'AI Agents', icon: '🤖' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ]

  return (
    <div style={{
      width: '400px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid rgba(51, 65, 85, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="button secondary"
            style={{
              flex: 1,
              borderRadius: 0,
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              padding: '12px 16px',
              fontSize: '14px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        {activeTab === 'agents' && <AgentStatusPanel />}
        {activeTab === 'tasks' && <TaskQueue />}
        {activeTab === 'reports' && <DamageReports />}
      </div>
    </div>
  )
}

export default Sidebar