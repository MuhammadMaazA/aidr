import { create } from 'zustand'
import axios from 'axios'

export interface DisasterEvent {
  id: number
  name: string
  event_type: string
  latitude: number
  longitude: number
  severity: number
  status: string
  description?: string
  created_at: string
  updated_at?: string
}

export interface DamageReport {
  id: number
  disaster_id: number
  latitude: number
  longitude: number
  damage_type: string
  severity: number
  description?: string
  source: string
  confidence: number
  verified: boolean
  created_at: string
}

export interface Resource {
  id: number
  name: string
  resource_type: string
  latitude: number
  longitude: number
  status: string
  capacity: number
  current_load: number
  created_at: string
  updated_at?: string
}

export interface Task {
  id: number
  disaster_id: number
  title: string
  description?: string
  task_type: string
  priority: number
  status: string
  assigned_resources?: string
  latitude: number
  longitude: number
  estimated_duration?: number
  created_at: string
  updated_at?: string
}

export interface AgentStatus {
  agent_type: string
  status: string
  message: string
  data?: any
  last_update: string
}

interface Store {
  // Data
  disasters: DisasterEvent[]
  damageReports: DamageReport[]
  resources: Resource[]
  tasks: Task[]
  agentStatuses: Record<string, AgentStatus>
  
  // UI State
  selectedDisaster: DisasterEvent | null
  isLoading: boolean
  error: string | null
  websocket: WebSocket | null
  
  // Actions
  setDisasters: (disasters: DisasterEvent[]) => void
  setDamageReports: (reports: DamageReport[]) => void
  setResources: (resources: Resource[]) => void
  setTasks: (tasks: Task[]) => void
  setSelectedDisaster: (disaster: DisasterEvent | null) => void
  updateAgentStatus: (status: AgentStatus) => void
  addDamageReport: (report: DamageReport) => void
  addTask: (task: Task) => void
  updateTaskStatus: (taskId: number, status: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // API Actions
  fetchInitialData: () => Promise<void>
  connectWebSocket: () => void
  disconnectWebSocket: () => void
}

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export const useStore = create<Store>((set, get) => ({
  // Initial state
  disasters: [],
  damageReports: [],
  resources: [],
  tasks: [],
  agentStatuses: {},
  selectedDisaster: null,
  isLoading: false,
  error: null,
  websocket: null,

  // Setters
  setDisasters: (disasters) => set({ disasters }),
  setDamageReports: (damageReports) => set({ damageReports }),
  setResources: (resources) => set({ resources }),
  setTasks: (tasks) => set({ tasks }),
  setSelectedDisaster: (selectedDisaster) => set({ selectedDisaster }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateAgentStatus: (status) => set((state) => ({
    agentStatuses: {
      ...state.agentStatuses,
      [status.agent_type]: {
        ...status,
        last_update: new Date().toISOString()
      }
    }
  })),

  addDamageReport: (report) => set((state) => ({
    damageReports: [...state.damageReports, report]
  })),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTaskStatus: async (taskId, status) => {
    try {
      // Update backend
      await axios.put(`${API_BASE}/tasks/${taskId}?status=${status}`)
      
      // Update local state
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      }))
    } catch (error) {
      console.error('Failed to update task status:', error)
      get().setError('Failed to update task status')
    }
  },

  // API Actions
  fetchInitialData: async () => {
    const { setLoading, setError, setDisasters, setDamageReports, setResources, setTasks } = get()
    
    setLoading(true)
    setError(null)
    
    try {
      const [disastersRes, reportsRes, resourcesRes, tasksRes] = await Promise.all([
        axios.get(`${API_BASE}/disasters/`),
        axios.get(`${API_BASE}/damage-reports/`),
        axios.get(`${API_BASE}/resources/`),
        axios.get(`${API_BASE}/tasks/`)
      ])
      
      setDisasters(disastersRes.data)
      setDamageReports(reportsRes.data)
      setResources(resourcesRes.data)
      setTasks(tasksRes.data)
      
      // Set first disaster as selected if none selected
      if (disastersRes.data.length > 0 && !get().selectedDisaster) {
        set({ selectedDisaster: disastersRes.data[0] })
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  },

  connectWebSocket: () => {
    const { updateAgentStatus, addDamageReport, addTask, updateTaskStatus } = get()
    
    // Close existing connection
    const existingWs = get().websocket
    if (existingWs) {
      existingWs.close()
    }
    
    // Connect to backend WebSocket
    const wsUrl = 'ws://127.0.0.1:8000/api/v1/ws'
    
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      set({ websocket: ws })
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'agent_update':
            updateAgentStatus({
              agent_type: data.agent_type,
              status: data.status,
              message: data.message,
              data: data.data,
              last_update: new Date().toISOString()
            })
            break
            
          case 'damage_report':
            // Fetch updated damage reports
            axios.get(`${API_BASE}/damage-reports/`)
              .then(response => set({ damageReports: response.data }))
              .catch(console.error)
            break
            
          case 'new_task':
            // Fetch updated tasks
            axios.get(`${API_BASE}/tasks/`)
              .then(response => set({ tasks: response.data }))
              .catch(console.error)
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      set({ error: 'WebSocket connection error' })
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      set({ websocket: null })
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (!get().websocket) {
          get().connectWebSocket()
        }
      }, 5000)
    }
  },

  disconnectWebSocket: () => {
    const ws = get().websocket
    if (ws) {
      ws.close()
      set({ websocket: null })
    }
  }
}))