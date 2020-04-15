'use strict'

const got = require('got')

// https://github.com/nock/nock/issues/1523
module.exports = got.extend({ retry: 0 })
