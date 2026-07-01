const { createClient } = require('@supabase/supabase-js')

let supabase = null

async function initSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    console.log('ℹ️  No Supabase config — using built-in storage (perfect for getting started)')
    return null
  }

  supabase = createClient(url, key)
  console.log('✅ Supabase connected')
  return supabase
}

function getSupabase() {
  return supabase
}

// In-memory fallback when Supabase isn't configured
const memoryDB = {
  styles: [
    { id: 'anime', name: '日系动漫', icon: '🌸', category: 'portrait', prompt_template: 'Convert this photo into a Japanese anime portrait style. Soft pastel colors, large expressive eyes, clean linework. Cute sticker aesthetic.', version: 3, rating: 5, usage_count: 56, created_at: new Date().toISOString() },
    { id: 'comic', name: '美式漫画', icon: '💥', category: 'portrait', prompt_template: 'Transform this photo into an American comic book style. Bold outlines, halftone dots, dynamic poses, vibrant primary colors.', version: 2, rating: 4, usage_count: 32, created_at: new Date().toISOString() },
    { id: 'pixel', name: '像素复古', icon: '👾', category: 'portrait', prompt_template: 'Convert this photo into pixel art style, 16-bit retro game aesthetic. Limited color palette, chunky pixels, nostalgic feel.', version: 1, rating: 4, usage_count: 18, created_at: new Date().toISOString() },
    { id: 'chibi', name: 'Q版萌宠', icon: '🐾', category: 'pet', prompt_template: 'Transform this pet photo into a super cute chibi kawaii style. Round shapes, tiny body big head, sparkly eyes, pastel colors.', version: 2, rating: 5, usage_count: 41, created_at: new Date().toISOString() },
    { id: 'watercolor', name: '水彩手绘', icon: '🎨', category: 'portrait', prompt_template: 'Reimagine this photo as a delicate watercolor painting. Soft washes of color, gentle brush strokes, artistic hand-painted feel.', version: 1, rating: 3, usage_count: 12, created_at: new Date().toISOString() },
    { id: 'cheer', name: '治愈鼓励', icon: '💝', category: 'text', prompt_template: 'Create a cute sticker illustration with encouraging words. Incorporate the subjects mood into a heartwarming design with soft typography.', version: 2, rating: 4, usage_count: 27, created_at: new Date().toISOString() },
  ],
  generations: [],
  genIdCounter: 1,
}

// === DB queries (works with Supabase or memory fallback) ===

async function getStyles() {
  if (supabase) {
    const { data } = await supabase.from('styles').select('*').order('usage_count', { ascending: false })
    return data || memoryDB.styles
  }
  return memoryDB.styles
}

async function createStyle(style) {
  if (supabase) {
    const { data, error } = await supabase.from('styles').insert(style).select().single()
    if (error) throw error
    return data
  }
  memoryDB.styles.push({ ...style, version: 1, rating: 0, usage_count: 0, created_at: new Date().toISOString() })
  return style
}

async function updateStyle(id, updates) {
  if (supabase) {
    const { data, error } = await supabase.from('styles').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const idx = memoryDB.styles.findIndex(s => s.id === id)
  if (idx >= 0) Object.assign(memoryDB.styles[idx], updates)
  return memoryDB.styles[idx]
}

async function deleteStyle(id) {
  if (supabase) {
    const { error } = await supabase.from('styles').delete().eq('id', id)
    if (error) throw error
    return
  }
  memoryDB.styles = memoryDB.styles.filter(s => s.id !== id)
}

async function saveGeneration(gen) {
  if (supabase) {
    const { data, error } = await supabase.from('generations').insert(gen).select().single()
    if (error) throw error
    return data
  }
  const record = { id: memoryDB.genIdCounter++, ...gen, created_at: new Date().toISOString() }
  memoryDB.generations.unshift(record)
  return record
}

async function getGenerations(page = 1, limit = 20) {
  if (supabase) {
    const from = (page - 1) * limit
    const { data } = await supabase.from('generations').select('*').order('created_at', { ascending: false }).range(from, from + limit - 1)
    return data || []
  }
  const start = (page - 1) * limit
  return memoryDB.generations.slice(start, start + limit)
}

async function getGenerationById(id) {
  if (supabase) {
    const { data } = await supabase.from('generations').select('*').eq('id', id).single()
    return data
  }
  return memoryDB.generations.find(g => g.id === id)
}

// Increment usage counter for a style
async function incrementStyleUsage(styleId) {
  if (supabase) {
    await supabase.rpc('increment_usage', { style_id: styleId }).catch(() => {})
    return
  }
  const style = memoryDB.styles.find(s => s.id === styleId)
  if (style) style.usage_count = (style.usage_count || 0) + 1
}

module.exports = {
  initSupabase, getSupabase,
  getStyles, createStyle, updateStyle, deleteStyle,
  saveGeneration, getGenerations, getGenerationById,
  incrementStyleUsage,
}
