import { useState } from 'react'

export default function AIAnalysis({ records, profile }) {
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)

  const getAnalysis = async () => {
    if (records.length === 0) {
      alert('请先记录体重数据')
      return
    }

    setLoading(true)

    try {
      const weightData = records.map(r => `${r.date}: ${r.weight}kg`).join('\n')
      const currentWeight = records[records.length - 1].weight
      const bmi = (currentWeight / ((profile.height / 100) ** 2)).toFixed(1)

      const prompt = `你是一位专业的女性健康顾问。请分析以下数据并给出温馨建议：

身高: ${profile.height}cm
目标体重: ${profile.targetWeight}kg
当前体重: ${currentWeight}kg
BMI: ${bmi}

体重记录:
${weightData}

请用温柔、鼓励的语气给出：
1. 体重趋势分析
2. 健康评估
3. 实用的减肥建议（饮食+运动）
4. 鼓励的话

回复要简洁、实用、充满正能量。`

      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      console.log('响应状态:', response.status)
      const data = await response.json()
      console.log('响应数据:', data)

      if (!response.ok) {
        throw new Error(data.error || `请求失败: ${response.status}`)
      }
      if (data.error) throw new Error(data.error)
      setAnalysis(data.text)
    } catch (error) {
      alert('分析失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>🤖 AI智能分析</h2>
      <button onClick={getAnalysis} disabled={loading || records.length === 0}>
        {loading ? '分析中...' : '获取AI建议'}
      </button>
      {analysis && (
        <div className="analysis-result">
          {analysis}
        </div>
      )}
    </div>
  )
}
