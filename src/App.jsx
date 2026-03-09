import { useState } from 'react'
import WeightTracker from './components/WeightTracker'
import AIAnalysis from './components/AIAnalysis'
import './App.css'

export default function App() {
  const [records, setRecords] = useState([])
  const [profile, setProfile] = useState({ height: 165, age: 25, targetWeight: 50 })

  return (
    <div className="app">
      <h1>💕 减肥小助手</h1>
      <WeightTracker
        records={records}
        setRecords={setRecords}
        profile={profile}
        setProfile={setProfile}
      />
      <AIAnalysis records={records} profile={profile} />
    </div>
  )
}
