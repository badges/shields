'use strict'

const { test, given } = require('sazerac')
const ContinuousPhp = require('./continuousphp.service')

describe('ContinuousPhp', function() {
  test(ContinuousPhp.render, () => {
    given({ status: 'unstable' }).expect({
      label: 'build',
      message: 'unstable',
      color: 'yellow',
    })
    given({ status: 'running' }).expect({
      label: 'build',
      message: 'running',
      color: 'blue',
    })
  })
})
