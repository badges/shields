'use strict'

module.exports = {
  port: 1111,
  get testedServerUrl() {
    return process.env.TESTED_SERVER_URL || `http://localhost:${this.port}`
  },
}
