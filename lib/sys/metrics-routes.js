'use strict'

function setRoutes(server, register, config) {
  server.route(/^\/metrics$/, (data, match, end, ask) => {
    const ip =
      (ask.req.headers['x-forwarded-for'] || '').split(', ')[0] ||
      ask.req.socket.remoteAddress
    // /(?!)/ matcher nothing
    if ((config.allowedIps || /(?!)/).test(ip)) {
      ask.res.setHeader('Content-Type', register.contentType)
      ask.res.end(register.metrics())
    } else {
      ask.res.statusCode = 403
      ask.res.end()
    }
  })
}

module.exports = {
  setRoutes,
}
