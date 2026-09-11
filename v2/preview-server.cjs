const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

const PORT = Number(process.env.PORT || 10000)
const DIST = path.join(__dirname, 'dist')
const API_ORIGIN = new URL(process.env.PULSE_API_ORIGIN || 'https://tinvest-pulse.onrender.com')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
}

function sendFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    securityHeaders(res)
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
    if (ext === '.html') res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    else if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    else res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Length', stat.size)
    fs.createReadStream(filePath).pipe(res)
  })
}

function proxyApi(req, res) {
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    securityHeaders(res)
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end('Preview API proxy is read-only')
    return
  }

  const target = new URL(req.url, API_ORIGIN)
  const upstream = https.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || 443,
    path: `${target.pathname}${target.search}`,
    method: req.method,
    headers: {
      Accept: req.headers.accept || 'application/json',
      'User-Agent': 'TInvest-Pulse-v2-preview/1.0',
    },
    timeout: 25000,
  }, upstreamRes => {
    securityHeaders(res)
    res.statusCode = upstreamRes.statusCode || 502
    const contentType = upstreamRes.headers['content-type']
    if (contentType) res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'no-store')
    upstreamRes.pipe(res)
  })

  upstream.on('timeout', () => upstream.destroy(new Error('API timeout')))
  upstream.on('error', err => {
    if (res.headersSent) return res.end()
    securityHeaders(res)
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: false, error: `Preview API proxy failed: ${err.message}` }))
  })
  upstream.end()
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/'
  const pathname = decodeURIComponent(rawUrl.split('?')[0])

  if (pathname === '/healthz') {
    securityHeaders(res)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    return res.end(JSON.stringify({ ok: true, service: 'tinvest-pulse-v2-preview', apiOrigin: API_ORIGIN.origin }))
  }

  if (pathname.startsWith('/api/')) return proxyApi(req, res)

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const candidate = path.normalize(path.join(DIST, relative))
  if (!candidate.startsWith(DIST)) {
    res.statusCode = 400
    return res.end('Bad request')
  }

  fs.stat(candidate, (err, stat) => {
    if (!err && stat.isFile()) return sendFile(res, candidate)
    sendFile(res, path.join(DIST, 'index.html'))
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TInvest Pulse 2.0 preview listening on ${PORT}`)
  console.log(`Read-only API proxy -> ${API_ORIGIN.origin}`)
})
