/**
 * 阿里通义万相 — 人像风格重绘
 * ============================
 * 模型：wanx-style-repaint-v1
 * API：POST /api/v1/services/aigc/image-generation/generation
 *
 * 获取 API Key：https://dashscope.console.aliyun.com/apiKey
 */

const API_KEY = process.env.DASHSCOPE_API_KEY
const BASE_URL = 'https://dashscope.aliyuncs.com'

// 我们的风格 ID → wanx-style-repaint-v1 style_index 映射
const STYLE_INDEX_MAP = {
  'anime': 2,       // 二次元 → 日系动漫
  'comic': 0,       // 复古漫画 → 美式漫画
  'watercolor': 3,  // 小清新 → 水彩手绘
  'pixel': 4,       // 未来科技 → 像素复古
  'chibi': 7,       // 炫彩卡通 → Q版萌宠
  'cheer': 7,       // 炫彩卡通 → 治愈鼓励
}

// style_index 对应的风格名
const STYLE_INDEX_NAMES = [
  '复古漫画',   // 0
  '3D童话',     // 1
  '二次元',     // 2
  '小清新',     // 3
  '未来科技',   // 4
  '国画古风',   // 5
  '将军百战',   // 6
  '炫彩卡通',   // 7
  '清雅国风',   // 8
  '喜迎新年',   // 9
]

/**
 * 提交生成任务并轮询获取结果
 */
async function generateImage(photoBuffer, styleId, customPrompt = '') {
  const photoBase64 = photoBuffer.toString('base64')
  const photoDataUrl = `data:image/jpeg;base64,${photoBase64}`

  // 确定 style_index
  const styleIndex = STYLE_INDEX_MAP[styleId] ?? 2
  const styleName = STYLE_INDEX_NAMES[styleIndex]
  console.log(`  ${styleId} → style_index=${styleIndex} (${styleName})`)

  // 提交异步任务
  const response = await fetch(
    `${BASE_URL}/api/v1/services/aigc/image-generation/generation`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wanx-style-repaint-v1',
        input: {
          image_url: photoDataUrl,
          style_index: styleIndex,
        },
      }),
    }
  )

  const data = await response.json()
  if (data.code) {
    throw new Error(`风格重绘错误: ${data.message || data.code}`)
  }

  const taskId = data.output.task_id
  console.log(`  任务已提交: ${taskId}`)

  // 轮询等结果
  const resultUrl = await pollTaskResult(taskId)

  return {
    imageUrl: resultUrl,
    revisedPrompt: `${styleName}风格重绘`,
    description: styleName,
  }
}

/**
 * 轮询异步任务结果
 */
async function pollTaskResult(taskId) {
  for (let i = 0; i < 90; i++) {
    await sleep(2000)

    const response = await fetch(
      `${BASE_URL}/api/v1/tasks/${taskId}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    const data = await response.json()

    if (data.output?.task_status === 'SUCCEEDED') {
      const url = data.output.results?.[0]?.url
      if (url) {
        console.log('  生成完成')
        return url
      }
      throw new Error('返回成功但没有图片URL')
    }

    if (data.output?.task_status === 'FAILED') {
      throw new Error(`生成失败: ${data.output.message || '未知'}`)
    }

    if (i % 5 === 4) console.log(`  等待... ${(i + 1) * 2}s`)
  }
  throw new Error('生成超时（等了3分钟）')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { generateImage }
