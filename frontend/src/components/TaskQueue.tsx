import React from 'react'
import { useStore } from '../state/store'

const TaskQueue: React.FC = () => {
  const { tasks, updateTaskStatus } = useStore()

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return '#ef4444' // High priority - red
    if (priority >= 3) return '#f59e0b' // Medium priority - yellow
    return '#10b981' // Low priority - green
  }

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'rescue':
        return '🚑'
      case 'medical':
        return '🏥'
      case 'assessment':
        return '🔍'
      case 'logistics':
        return '📦'
      default:
        return '📋'
    }
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      updateTaskStatus(taskId, newStatus)
      // The API call will be handled by the store or could be added here
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority (highest first), then by created date
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const pendingTasks = sortedTasks.filter(task => task.status === 'pending')
  const inProgressTasks = sortedTasks.filter(task => task.status === 'in_progress')
  const completedTasks = sortedTasks.filter(task => task.status === 'completed')

  const TaskItem: React.FC<{ task: any }> = ({ task }) => (
    <div className="card" style={{
      border: `1px solid ${getPriorityColor(task.priority)}40`,
      borderLeft: `4px solid ${getPriorityColor(task.priority)}`
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
            {getTaskTypeIcon(task.task_type)}
          </span>
          <span style={{ fontWeight: 'bold' }}>
            {task.title}
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            background: getPriorityColor(task.priority),
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            P{task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <div style={{
          fontSize: '14px',
          color: '#94a3b8',
          marginBottom: '8px'
        }}>
          {task.description}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span>
          {task.task_type} • {task.estimated_duration ? `${task.estimated_duration}min` : 'No estimate'}
        </span>
        <span>
          {new Date(task.created_at).toLocaleTimeString()}
        </span>
      </div>

      {task.status === 'pending' && (
        <div style={{ marginTop: '8px' }}>
          <button
            className="button"
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={() => handleStatusChange(task.id, 'in_progress')}
          >
            Start Task
          </button>
        </div>
      )}

      {task.status === 'in_progress' && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <button
            className="button"
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={() => handleStatusChange(task.id, 'completed')}
          >
            Complete
          </button>
          <button
            className="button secondary"
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={() => handleStatusChange(task.id, 'pending')}
          >
            Pause
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0' }}>📋 Task Queue</h3>
      
      {tasks.length === 0 ? (
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            No tasks assigned yet. AI agents will create tasks based on damage assessments.
          </p>
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Pending ({pendingTasks.length})
              </h4>
              {pendingTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </>
          )}

          {inProgressTasks.length > 0 && (
            <>
              <h4 style={{ 
                margin: '16px 0 8px 0', 
                fontSize: '14px', 
                color: '#3b82f6',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                In Progress ({inProgressTasks.length})
              </h4>
              {inProgressTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </>
          )}

          {completedTasks.length > 0 && (
            <>
              <h4 style={{ 
                margin: '16px 0 8px 0', 
                fontSize: '14px', 
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Completed ({completedTasks.length})
              </h4>
              {completedTasks.slice(0, 5).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {completedTasks.length > 5 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#64748b', 
                  fontSize: '12px',
                  padding: '8px'
                }}>
                  ... and {completedTasks.length - 5} more completed tasks
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default TaskQueue