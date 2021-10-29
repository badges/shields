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
  askres.setHeader('Content-Length', Buffer.byteLength(res, 'utf8'))
  end(null, { template: streamFromString(res) })
}

function sendJSON(res, askres, end) {
  askres.setHeader('Content-Type', 'application/json')
  askres.setHeader('Access-Control-Allow-Origin', '*')
  askres.setHeader('Content-Length', Buffer.byteLength(res, 'utf8'))
  end(null, { template: streamFromString(res) })
}

function makeSend(format, askres, end) {
  if (format === 'svg') {
    return res => sendSVG(res, askres, end)
  } else if (format === 'json') {
    return res => sendJSON(res, askres, end)
  } else {
    throw Error(`Unrecognized format: ${format}`)
  }
}

export { makeSend }
