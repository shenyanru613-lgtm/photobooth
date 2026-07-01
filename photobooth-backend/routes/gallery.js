const express = require('express')
const router = express.Router()
const { getGenerations } = require('../services/supabase')

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)
    const generations = await getGenerations(page, limit)
    res.json({ generations, page, limit })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
