'use strict'

const glob = require('glob')

function loadServiceClasses() {
  // New-style services
  const services = glob
    .sync(`${__dirname}/**/*.service.js`)
    .map(path => require(path))

  const serviceClasses = []
  services.forEach(service => {
    if (typeof service === 'function') {
      serviceClasses.push(service)
    } else {
      for (const serviceClass in service) {
        serviceClasses.push(service[serviceClass])
      }
    }
  })

  return serviceClasses
}

function loadTesters() {
  return glob.sync(`${__dirname}/**/*.tester.js`).map(path => require(path))
}

module.exports = {
  loadServiceClasses,
  loadTesters,
}
