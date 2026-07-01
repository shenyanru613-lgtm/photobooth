const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')

// Simple in-memory share store
const shares = {}

// POST /api/share — create share link
router.post('/', async (req, res) => {
  try {
    const { generationId } = req.body
    if (!generationId) {
      return res.status(400).json({ message: '缺少 generationId' })
    }

    const code = uuidv4().slice(0, 8)
    const baseUrl = process.env.RENDER_EXTERNAL_URL
      || `http://localhost:${process.env.PORT || 3001}`

    shares[code] = {
      generationId,
      createdAt: new Date().toISOString(),
    }

    res.json({
      code,
      shareUrl: `${baseUrl}/api/share/${code}`,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/share/:code — get shared content
router.get('/:code', async (req, res) => {
  try {
    const share = shares[req.params.code]
    if (!share) {
      return res.status(404).json({ message: '分享链接已过期或不存在' })
    }

    const { getGenerationById } = require('../services/supabase')
    const gen = await getGenerationById(parseInt(share.generationId) || share.generationId)

    if (!gen) {
      return res.status(404).json({ message: '内容已不存在' })
    }

    res.json({ generation: gen })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
