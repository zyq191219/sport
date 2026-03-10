import { useState } from 'react'
import WeightTracker from './components/WeightTracker'
import AIAnalysis from './components/AIAnalysis'
import './App.css'

export default function App() {
  const [records, setRecords] = useState([])
  const [profile, setProfile] = useState({ height: '160', currentWeight: '56', targetWeight: '51', age: '25' })
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!profile.height || !profile.currentWeight || !profile.targetWeight) {
      alert('请先填写完整的个人信息')
      return
    }

    setLoading(true)
    try {
      const bmi = (profile.currentWeight / ((profile.height / 100) ** 2)).toFixed(1)
      const weightDiff = profile.currentWeight - profile.targetWeight

      const prompt = `你是一位专业的减肥健康顾问。请根据以下信息制定详细的减肥计划：

身高: ${profile.height}cm
当前体重: ${profile.currentWeight}kg
目标体重: ${profile.targetWeight}kg
需要减重: ${weightDiff.toFixed(1)}kg
BMI: ${bmi}
年龄: ${profile.age || '未提供'}岁

请给出：
1. 健康评估和减肥目标分析
2. 详细的饮食计划（早中晚餐建议）
3. 运动计划（每周安排）
4. 预计达成时间
5. 注意事项和鼓励

回复要专业、实用、充满正能量。`

      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '分析失败')
      setAnalysis(data.text)
    } catch (error) {
      alert('分析失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>💪 乐乐的减肥计划表</h1>

      {/* 个人信息卡片 */}
      <div className="card profile-card">
        <h2>📋 个人信息</h2>
        <div className="profile-grid">
          <div className="profile-item">
            <label>身高 (cm)</label>
            <input
              type="number"
              placeholder="165"
              value={profile.height}
              onChange={e => setProfile({ ...profile, height: e.target.value })}
            />
          </div>
          <div className="profile-item">
            <label>年龄</label>
            <input
              type="number"
              placeholder="25"
              value={profile.age}
              onChange={e => setProfile({ ...profile, age: e.target.value })}
            />
          </div>
          <div className="profile-item">
            <label>当前体重 (kg)</label>
            <input
              type="number"
              placeholder="60"
              value={profile.currentWeight}
              onChange={e => setProfile({ ...profile, currentWeight: e.target.value })}
            />
          </div>
          <div className="profile-item">
            <label>目标体重 (kg)</label>
            <input
              type="number"
              placeholder="50"
              value={profile.targetWeight}
              onChange={e => setProfile({ ...profile, targetWeight: e.target.value })}
            />
          </div>
        </div>

        {profile.height && profile.currentWeight && profile.targetWeight && (
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">BMI</span>
              <span className="stat-value">
                {(profile.currentWeight / ((profile.height / 100) ** 2)).toFixed(1)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">需减重</span>
              <span className="stat-value highlight">
                {(profile.currentWeight - profile.targetWeight).toFixed(1)} kg
              </span>
            </div>
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !profile.height || !profile.currentWeight || !profile.targetWeight}
        >
          {loading ? '🔄 分析中...' : '✨ 一键生成减肥计划'}
        </button>
      </div>

      {/* AI分析结果 */}
      {analysis && (
        <div className="card plan-card">
          <h2>📝 您的专属减肥计划</h2>
          <div className="analysis-result">
            {analysis}
          </div>
        </div>
      )}

      {/* 体重追踪 */}
      <WeightTracker
        records={records}
        setRecords={setRecords}
        profile={profile}
      />
    </div>
  )
}
