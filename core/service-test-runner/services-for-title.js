'use strict'

const difference = require('lodash.difference')

module.exports = function servicesForTitle(title) {
  const bracketed = /\[([^\]]+)\]/g

  const preNormalized = title.toLowerCase()

  let services = []
  let match
  while ((match = bracketed.exec(preNormalized))) {
    const [, bracketed] = match
    services = services.concat(bracketed.split(' '))
  }
  services = services.filter(Boolean).map(service => service.toLowerCase())

  const ignored = ['wip', 'rfc', 'security']
  return difference(services, ignored)
}
