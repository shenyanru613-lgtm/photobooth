const express = require('express')
const router = express.Router()
const { getStyles, createStyle, updateStyle, deleteStyle } = require('../services/supabase')

// GET /api/styles
router.get('/', async (req, res) => {
  try {
    const styles = await getStyles()
    res.json({ styles })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/styles
router.post('/', async (req, res) => {
  try {
    const { name, prompt_template, category, icon } = req.body
    if (!name || !prompt_template) {
      return res.status(400).json({ message: '名称和提示词模板不能为空' })
    }

    // Generate ID from name
    const id = name.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '')
    const style = await createStyle({
      id,
      name,
      prompt_template,
      category: category || 'portrait',
      icon: icon || '🎯',
    })
    res.json({ style })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/styles/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, prompt_template, category, icon, rating } = req.body
    const updates = {}
    if (name !== undefined) updates.name = name
    if (prompt_template !== undefined) updates.prompt_template = prompt_template
    if (category !== undefined) updates.category = category
    if (icon !== undefined) updates.icon = icon
    if (rating !== undefined) updates.rating = rating

    const style = await updateStyle(req.params.id, updates)
    res.json({ style })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/styles/:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteStyle(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
