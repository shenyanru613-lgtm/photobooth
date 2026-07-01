// API service — talks to the photobooth backend
// In dev, use localhost. In production, set VITE_API_URL in Vercel env vars.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = { headers: {}, ...options }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, config)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

// === Generate ===
export async function generateImage(photoFile, styleId, customPrompt) {
  const form = new FormData()
  form.append('photo', photoFile)
  form.append('styleId', styleId)
  if (customPrompt) form.append('customPrompt', customPrompt)
  return request('/generate', { method: 'POST', body: form })
}

// === Styles ===
export async function getStyles() {
  return request('/styles')
}

export async function createStyle(data) {
  return request('/styles', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateStyle(id, data) {
  return request(`/styles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteStyle(id) {
  return request(`/styles/${id}`, { method: 'DELETE' })
}

// === Gallery ===
export async function getGallery(page = 1, limit = 20) {
  return request(`/gallery?page=${page}&limit=${limit}`)
}

// === Print (Phase 1: PC relay) ===
export async function printImage(generationId, options = {}) {
  return request('/print', {
    method: 'POST',
    body: JSON.stringify({ generationId, ...options }),
  })
}

// === Share ===
export async function createShare(generationId) {
  return request('/share', { method: 'POST', body: JSON.stringify({ generationId }) })
}

export async function getShare(code) {
  return request(`/share/${code}`)
}
