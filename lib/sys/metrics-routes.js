'use strict'

function setRoutes(server, register) {
  server.route(/^\/metrics$/, (data, match, end, ask) => {
    ask.res.setHeader('Content-Type', register.contentType)
    ask.res.end(register.metrics())
  })
}

module.exports = {
  setRoutes,
}
