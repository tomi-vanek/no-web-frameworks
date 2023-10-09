import http from 'http'
import { promises as fsPromise } from 'fs'

import { mimeForFile } from './mime.js'

export async function runServer (port) {
  startLog()
  const server = http.createServer(requestHandler)
  server.listen(port, () => runningLog(port))
}

async function requestHandler (request, response) {
  const filePath = request.url.startsWith('/web_modules')
    ? request.url.substring(1)
    : `public${request.url}${request.url.endsWith('/') ? 'index.html' : ''}`
  const contentType = mimeForFile(filePath)
  console.log(`request ${request.url} --> ${filePath} [${contentType}]`)

  try {
    const content = await fsPromise.readFile(filePath)
    response.writeHead(200, { 'Content-Type': contentType })
    response.end(content)
  } catch (err) {
    const [msg, code] = (err.code === 'ENOENT')
      ? [`Not found: ${filePath}`, 404]
      : [`Unexpected error: ${err}`, 500]
    errorResponse(response, msg, code)
  }
}

function errorResponse (response, msg, code) {
  response.writeHead(code, { 'Content-Type': 'text/plain' })
  response.end(msg, 'utf-8')
}

function startLog () {
  const [date, time] = new Date().toISOString().split(/[TZ.]/)
  const msg = `Starting on ${date} at ${time} UTC`
  const padding = 2
  const line = `${'~'.repeat(msg.length + 2 * padding)}`
  console.log(`
${line}
${' '.repeat((line.length - msg.length) / 2)}${msg}
${line}
`)
}

function runningLog (port) {
  const runningMsg = `... Listening on http://localhost:${port}
`
  console.log(runningMsg)
}
