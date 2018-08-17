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

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

function identifyServices(paths) {
  return paths
    .map(file => {
      const match = file.match(/^services\/(.+)\/.+\.service.js$/)
      return match ? match[1] : undefined
    })
    .filter(Boolean)
    .filter(onlyUnique)
}

function identifyTesters(paths) {
  return paths
    .map(file => {
      const match = file.match(/^services\/(.+)\/.+\.tester.js$/)
      return match ? match[1] : undefined
    })
    .filter(Boolean)
    .filter(onlyUnique)
}

module.exports = {
  loadServiceClasses,
  loadTesters,
  identifyServices,
  identifyTesters,
}
