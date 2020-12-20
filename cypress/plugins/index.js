'use strict'
const percyHealthCheck = require('@percy/cypress/task')

module.exports = (on, config) => {
  on('task', percyHealthCheck)
}
