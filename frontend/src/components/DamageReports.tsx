import React from 'react'
import { useStore } from '../state/store'

const DamageReports: React.FC = () => {
  const { damageReports } = useStore()

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return '#ef4444' // High severity - red
    if (severity >= 4) return '#f59e0b' // Medium severity - yellow
    return '#10b981' // Low severity - green
  }

  const getDamageTypeIcon = (damageType: string) => {
    switch (damageType) {
      case 'structural':
        return '🏢'
      case 'infrastructure':
        return '🛣️'
      case 'human':
        return '👥'
      case 'fire':
        return '🔥'
      case 'flood':
        return '🌊'
      case 'unknown':
      default:
        return '❓'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'social_media':
        return '📱'
      case 'drone':
        return '🚁'
      case 'field_report':
        return '👮'
      case 'satellite':
        return '🛰️'
      default:
        return '📊'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981' // High confidence - green
    if (confidence >= 0.5) return '#f59e0b' // Medium confidence - yellow
    return '#ef4444' // Low confidence - red
  }

  const sortedReports = [...damageReports].sort((a, b) => {
    // Sort by severity (highest first), then by created date (newest first)
    if (a.severity !== b.severity) {
      return b.severity - a.severity
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  if (damageReports.length === 0) {
    return (
      <div>
        <h3 style={{ margin: '0 0 16px 0' }}>📊 Damage Reports</h3>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            No damage reports received yet. AI agents will analyze incoming data and generate reports.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0' }}>📊 Damage Reports</h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span>Total: {damageReports.length}</span>
        <span>
          Verified: {damageReports.filter(r => r.verified).length}
        </span>
      </div>

      {sortedReports.map((report) => (
        <div key={report.id} className="card" style={{
          border: `1px solid ${getSeverityColor(report.severity)}40`,
          borderLeft: `4px solid ${getSeverityColor(report.severity)}`
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
              <span style={{ fontSize: '16px' }}>
                {getDamageTypeIcon(report.damage_type)}
              </span>
              <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {report.damage_type.replace('_', ' ')}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: getSeverityColor(report.severity),
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {report.severity}/10
              </span>
              {report.verified && (
                <span style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}>
                  ✓ VERIFIED
                </span>
              )}
            </div>
          </div>

          {report.description && (
            <div style={{
              fontSize: '14px',
              color: '#e2e8f0',
              marginBottom: '8px'
            }}>
              {report.description}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {getSourceIcon(report.source)}
              <span style={{ textTransform: 'capitalize' }}>
                {report.source.replace('_', ' ')}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: getConfidenceColor(report.confidence)
                }}
              />
              <span>
                {(report.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>

            <div>
              📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </div>
            
            <div>
              🕐 {formatTime(report.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DamageReports