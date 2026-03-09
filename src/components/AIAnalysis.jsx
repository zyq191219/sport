import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'

export default function AIAnalysis({ records, profile }) {
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)

  const getAnalysis = async () => {
    if (records.length === 0) {
      alert('请先记录体重数据')
      return
    }

    setLoading(true)
    const apiKey = prompt('请输入你的Claude API Key:')

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      const weightData = records.map(r => `${r.date}: ${r.weight}kg`).join('\n')
      const currentWeight = records[records.length - 1].weight
      const bmi = (currentWeight / ((profile.height / 100) ** 2)).toFixed(1)

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `你是一位专业的女性健康顾问。请分析以下数据并给出温馨建议：

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
        }]
      })

      setAnalysis(message.content[0].text)
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
        <div style={{ marginTop: 15, padding: 15, background: '#fff5f7', borderRadius: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {analysis}
        </div>
      )}
    </div>
  )
}

