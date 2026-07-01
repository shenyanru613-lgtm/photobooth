const express = require('express')
const router = express.Router()
const { getGenerationById } = require('../services/supabase')

// In-memory print job store + queue
const printJobs = new Map()
const printQueue = []

// POST /api/print
router.post('/', async (req, res) => {
  try {
    const { generationId, size, copies } = req.body

    if (!generationId) {
      return res.status(400).json({ message: '缺少 generationId' })
    }

    // Get generation record
    const gen = await getGenerationById(parseInt(generationId) || generationId)
    if (!gen) {
      return res.status(404).json({ message: '未找到该生成记录' })
    }

    const jobId = `print_${Date.now()}`
    const printJob = {
      jobId,
      generationId,
      imageUrl: gen.result_url,
      originalUrl: gen.original_url,
      styleName: gen.style_name,
      size: size || 'keychain',
      copies: copies || 1,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    printJobs.set(jobId, printJob)

    // Check if any PC print relay is connected
    const clients = global.printClients
    if (clients && clients.size > 0) {
      // Send to first connected relay
      const [firstId, firstClient] = clients.entries().next().value
      printJob.status = 'sending'
      printJob.printerName = firstClient.name
      global.io.to(firstId).emit('print_job', printJob)
      console.log(`Print job sent to ${firstClient.name}: ${jobId}`)
      res.json({ success: true, jobId, relayed: true, printer: firstClient.name })
    } else {
      // Queue for when relay connects
      printJob.status = 'pending'
      printQueue.push(jobId)
      console.log(`Print job queued (no relay connected): ${jobId}`)
      res.json({
        success: true,
        jobId,
        relayed: false,
        message: '打印任务已排队，等待PC打印服务连接。请确保电脑上的打印服务正在运行。',
      })
    }
  } catch (err) {
    console.error('Print error:', err)
    res.status(500).json({ message: err.message })
  }
})

// POST /api/print/:jobId/cancel
router.post('/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params
    const job = printJobs.get(jobId)
    if (!job) {
      return res.status(404).json({ message: '未找到该打印任务' })
    }

    job.status = 'cancelled'
    printJobs.set(jobId, job)

    // Remove from queue if present
    const qIdx = printQueue.indexOf(jobId)
    if (qIdx >= 0) printQueue.splice(qIdx, 1)

    // Notify relay if it was sent
    const clients = global.printClients
    if (clients?.size > 0) {
      global.io.emit('print_cancel', { jobId })
    }

    global.io.emit('print_status', { jobId, status: 'cancelled' })
    console.log(`Print job cancelled: ${jobId}`)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/print/status — check relays and specific job
router.get('/status', async (req, res) => {
  const { jobId } = req.query
  if (jobId) {
    const job = printJobs.get(jobId)
    return res.json({ job: job || null })
  }

  const clients = global.printClients
  const relays = []
  if (clients) {
    for (const [id, info] of clients) {
      relays.push({ id, name: info.name, status: info.status, connectedAt: info.connectedAt })
    }
  }
  res.json({ relayCount: relays.length, relays, queueLength: printQueue.length })
})

// WebSocket event handlers are in server.js
// print_done → update job status to done
// print_error → update job status to error

module.exports = router
module.exports.printJobs = printJobs
module.exports.printQueue = printQueue
