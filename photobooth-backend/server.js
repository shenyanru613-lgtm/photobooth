require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const fs = require('fs')

const generateRouter = require('./routes/generate')
const stylesRouter = require('./routes/styles')
const galleryRouter = require('./routes/gallery')
const printRouter = require('./routes/print')
const shareRouter = require('./routes/share')
const { initSupabase } = require('./services/supabase')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 20 * 1024 * 1024,
})

const PORT = process.env.PORT || 3001

// Uploads
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// Middleware
app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static(uploadsDir))
app.set('io', io)

// Init DB
initSupabase().catch(err =>
  console.warn('Supabase init skipped:', err.message)
)

// Routes
app.use('/api/generate', generateRouter)
app.use('/api/styles', stylesRouter)
app.use('/api/gallery', galleryRouter)
app.use('/api/print', printRouter)
app.use('/api/share', shareRouter)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==================== WebSocket: PC Print Relay ====================
const printClients = new Map()
const { printJobs, printQueue } = printRouter

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Register as print relay
  socket.on('register_print_relay', (data) => {
    printClients.set(socket.id, {
      name: data?.name || 'Unknown PC',
      connectedAt: new Date(),
      status: 'ready',
    })
    console.log(`Print relay registered: ${data?.name || 'Unknown'} (${socket.id})`)
    io.emit('print_relay_count', printClients.size)

    // Drain queue — send any pending print jobs
    while (printQueue.length > 0) {
      const jobId = printQueue.shift()
      const job = printJobs.get(jobId)
      if (job && job.status === 'pending') {
        job.status = 'sending'
        job.printerName = data?.name || 'Unknown PC'
        printJobs.set(jobId, job)
        socket.emit('print_job', job)
        io.emit('print_status', { jobId, status: 'sending' })
        console.log(`Queued job sent: ${jobId}`)
      }
    }
  })

  // Print completed
  socket.on('print_done', (data) => {
    const { jobId } = data
    const job = printJobs.get(jobId)
    if (job) { job.status = 'done'; printJobs.set(jobId, job) }
    console.log(`Print done: ${jobId}`)
    io.emit('print_status', { jobId, status: 'done' })
  })

  // Print failed
  socket.on('print_error', (data) => {
    const { jobId, error } = data
    const job = printJobs.get(jobId)
    if (job) { job.status = 'error'; job.errorMessage = error; printJobs.set(jobId, job) }
    console.error(`Print error: ${jobId} - ${error}`)
    io.emit('print_status', { jobId, status: 'error', error })
  })

  // Print progress update
  socket.on('print_progress', (data) => {
    io.emit('print_status', { jobId: data.jobId, status: 'printing', progress: data.progress })
  })

  socket.on('disconnect', () => {
    printClients.delete(socket.id)
    console.log(`Client disconnected: ${socket.id}`)
    io.emit('print_relay_count', printClients.size)
  })
})

global.io = io
global.printClients = printClients

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════╗
║   AI Photo Booth Backend v1.0       ║
║   Port: ${PORT}                        ║
║   http://localhost:${PORT}              ║
╚══════════════════════════════════════╝
  `)
})
