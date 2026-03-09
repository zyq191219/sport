import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeightTracker({ records, setRecords, profile, setProfile }) {
  const [weight, setWeight] = useState('')

  const addRecord = () => {
    if (!weight) return
    setRecords([...records, { date: new Date().toLocaleDateString('zh-CN'), weight: parseFloat(weight) }])
    setWeight('')
  }

  const bmi = records.length > 0 ? (records[records.length - 1].weight / ((profile.height / 100) ** 2)).toFixed(1) : 0

  return (
    <div className="card">
      <h2>📊 体重记录</h2>
      <div style={{ marginBottom: 15 }}>
        <input
          type="number"
          placeholder="身高(cm)"
          value={profile.height}
          onChange={e => setProfile({ ...profile, height: e.target.value })}
        />
        <input
          type="number"
          placeholder="目标体重(kg)"
          value={profile.targetWeight}
          onChange={e => setProfile({ ...profile, targetWeight: e.target.value })}
        />
      </div>
      <div style={{ marginBottom: 15 }}>
        <input
          type="number"
          placeholder="今日体重(kg)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
        />
        <button onClick={addRecord}>记录</button>
      </div>
      {records.length > 0 && (
        <>
          <p style={{ color: '#666', marginBottom: 10 }}>
            当前BMI: <strong style={{ color: bmi > 24 ? '#ff6b6b' : '#51cf66' }}>{bmi}</strong>
            {bmi < 18.5 && ' 偏瘦'}{bmi >= 18.5 && bmi < 24 && ' 正常'}{bmi >= 24 && ' 偏重'}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={records}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#ff69b4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}
