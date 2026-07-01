const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()

const { generateImage } = require('../services/tongyi')
const { getStyles, saveGeneration, incrementStyleUsage } = require('../services/supabase')

// File upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    cb(null, allowed.includes(file.mimetype))
  },
})

// Download image from URL to local
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      // Follow redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject)
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// POST /api/generate
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { styleId, customPrompt } = req.body
    const photoFile = req.file

    if (!photoFile) {
      return res.status(400).json({ message: '请上传照片' })
    }

    // Get style
    const styles = await getStyles()
    const style = styles.find(s => s.id === styleId) || styles[0]

    if (!style) {
      return res.status(400).json({ message: '未找到该风格，请先创建' })
    }

    // Optimize photo: resize to max 1024px, compress
    let photoBuffer = photoFile.buffer
    try {
      photoBuffer = await sharp(photoBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
    } catch (e) {
      console.warn('Sharp processing failed, using original:', e.message)
    }

    // Save original for gallery
    const genId = uuidv4()
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    const originalName = `${genId}_original.jpg`
    await fs.promises.writeFile(path.join(uploadsDir, originalName), photoBuffer)

    // Call Tongyi AI
    console.log(`🎨 Generating with style: ${style.name} (${styleId})`)
    const result = await generateImage(photoBuffer, styleId, customPrompt)

    // Download generated image from Tongyi
    const resultName = `${genId}_result.png`
    const resultBuffer = await downloadImage(result.imageUrl)
    await fs.promises.writeFile(path.join(uploadsDir, resultName), resultBuffer)
    console.log(`💾 Saved: ${resultName} (${resultBuffer.length} bytes)`)

    // Get server base URL
    const baseUrl = process.env.RENDER_EXTERNAL_URL
      || `http://localhost:${process.env.PORT || 3001}`

    // Save to gallery
    const generation = await saveGeneration({
      style_id: styleId,
      style_name: style.name,
      original_url: `${baseUrl}/uploads/${originalName}`,
      result_url: `${baseUrl}/uploads/${resultName}`,
      prompt_used: result.revisedPrompt,
    })

    // Increment usage
    await incrementStyleUsage(styleId)

    res.json({
      generationId: generation.id,
      imageUrl: `${baseUrl}/uploads/${resultName}`,
      originalUrl: `${baseUrl}/uploads/${originalName}`,
      styleName: style.name,
      description: result.description,
      revisedPrompt: result.revisedPrompt,
    })
  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).json({ message: err.message || 'AI 生成失败' })
  }
})

module.exports = router
