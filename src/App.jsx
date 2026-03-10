import { useState, useEffect } from 'react'
import WeightTracker from './components/WeightTracker'
import { marked } from 'marked'
import './App.css'

const API_KEY = 'sk-44084743-58aa-4fe0-834a-53f49494df40'
const API_URL = '/api-proxy/v1/chat/completions'

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? JSON.parse(decodeURIComponent(match[2])) : null
}

function setCookie(name, value) {
  const encoded = encodeURIComponent(JSON.stringify(value))
  document.cookie = `${name}=${encoded}; max-age=${60 * 60 * 24 * 365}; path=/`
}

export default function App() {
  const [records, setRecords] = useState(() => getCookie('records') || [])
  const [profile, setProfile] = useState(() => getCookie('profile') || { height: '158', currentWeight: '56', targetWeight: '53', age: '25' })
  const [analysis, setAnalysis] = useState(() => getCookie('analysis') || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setCookie('records', records) }, [records])
  useEffect(() => { setCookie('profile', profile) }, [profile])
  useEffect(() => { setCookie('analysis', analysis) }, [analysis])

  const handleAnalyze = async () => {
    if (!profile.height || !profile.currentWeight || !profile.targetWeight) {
      alert('请先填写完整的个人信息')
      return
    }

    setLoading(true)
    setAnalysis('')

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

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'Claude-Sonnet-4.6',
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || '分析失败')
      }

      // 流式读取响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              const content = json.choices[0]?.delta?.content || ''
              if (content) {
                setAnalysis(prev => prev + content)
              }
            } catch (e) {
              console.error('解析流数据失败:', e)
            }
          }
        }
      }
    } catch (error) {
      alert('分析失败: ' + error.message)
      setAnalysis('')
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
          <div className="analysis-result" dangerouslySetInnerHTML={{ __html: marked(analysis) }} />
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
