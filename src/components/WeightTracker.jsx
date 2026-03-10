import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeightTracker({ records, setRecords, profile }) {
  const [weight, setWeight] = useState('')

  const addRecord = () => {
    if (!weight || !profile.height) {
      alert('请先填写身高信息')
      return
    }
    setRecords([...records, { date: new Date().toLocaleDateString('zh-CN'), weight: parseFloat(weight) }])
    setWeight('')
  }

  const currentWeight = records.length > 0 ? records[records.length - 1].weight : profile.currentWeight
  const bmi = currentWeight && profile.height ? (currentWeight / ((profile.height / 100) ** 2)).toFixed(1) : 0

  const getBMIStatus = () => {
    if (bmi < 18.5) return { text: '偏瘦', color: '#ffa94d' }
    if (bmi < 24) return { text: '正常', color: '#51cf66' }
    return { text: '偏重', color: '#ff6b6b' }
  }
  const status = getBMIStatus()

  return (
    <div className="card">
      <h2>📈 体重追踪</h2>
      <div className="weight-input-row">
        <input
          type="number"
          placeholder="记录今日体重(kg)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
        />
        <button onClick={addRecord}>+ 记录</button>
      </div>

      {records.length > 0 && (
        <>
          <div className="progress-info">
            <div className="progress-item">
              <span className="progress-label">起始</span>
              <span className="progress-value">{records[0].weight} kg</span>
            </div>
            <div className="progress-arrow">→</div>
            <div className="progress-item">
              <span className="progress-label">当前</span>
              <span className="progress-value highlight">{currentWeight} kg</span>
            </div>
            <div className="progress-arrow">→</div>
            <div className="progress-item">
              <span className="progress-label">目标</span>
              <span className="progress-value">{profile.targetWeight} kg</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={records} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffe4f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#ff69b4" strokeWidth={3} dot={{ fill: '#ff69b4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="records-list">
            <h3>历史记录</h3>
            <div className="records-scroll">
              {records.slice().reverse().map((record, index) => (
                <div key={index} className="record-item">
                  <span className="record-date">{record.date}</span>
                  <span className="record-weight">{record.weight} kg</span>
                  {index < records.length - 1 && (
                    <span className={`record-change ${record.weight < records[records.length - index - 2].weight ? 'down' : 'up'}`}>
                      {record.weight < records[records.length - index - 2].weight ? '↓' : '↑'}
                      {Math.abs(record.weight - records[records.length - index - 2].weight).toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
