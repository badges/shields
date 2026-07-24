/**
 * Helpers for returning rendered badge responses through the legacy request
 * pipeline.
 *
 * @module
 */

import stream from 'stream'

function streamFromString(str) {
  const newStream = new stream.Readable()
  newStream._read = () => {
    newStream.push(str)
    newStream.push(null)
  }
  return newStream
}

function sendSVG(res, askres, end) {
  askres.setHeader('Content-Type', 'image/svg+xml;charset=utf-8')
  askres.setHeader('Content-Security-Policy', "script-src 'none';")
  askres.setHeader('Content-Length', Buffer.byteLength(res, 'utf8'))
  end(null, { template: streamFromString(res) })
}

function sendJSON(res, askres, end) {
  askres.setHeader('Content-Type', 'application/json')
  askres.setHeader('Content-Length', Buffer.byteLength(res, 'utf8'))
  end(null, { template: streamFromString(res) })
}

function sendEmpty(end) {
  end(null, { template: streamFromString('') })
}

/**
 * Create a sender for a rendered badge response in the requested format.
 *
 * @param {'svg'|'json'|'empty'} format - Response format to send.
 * @param {object} askres - HTTP response used to set format-specific headers.
 * @param {Function} end - Callback that completes the request.
 * @throws {Error} When the response format is not recognized.
 * @returns {Function} Function that sends the rendered response body.
 */
function makeSend(format, askres, end) {
  if (format === 'svg') {
    return res => sendSVG(res, askres, end)
  } else if (format === 'json') {
    return res => sendJSON(res, askres, end)
  } else if (format === 'empty') {
    return () => sendEmpty(end)
  } else {
    throw Error(`Unrecognized format: ${format}`)
  }
}

export { makeSend }
