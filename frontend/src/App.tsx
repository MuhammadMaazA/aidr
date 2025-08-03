import React, { useEffect } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { useStore } from './state/store'
import './App.css'

function App() {
  const { connectWebSocket, fetchInitialData } = useStore()

  useEffect(() => {
    // Initialize the application
    fetchInitialData()
    connectWebSocket()
  }, [fetchInitialData, connectWebSocket])

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Sidebar />
        <MapView />
      </div>
    </div>
  )
}

export default App