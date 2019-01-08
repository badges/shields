'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const { renderBuildStatusBadge } = require('./build-status')

test(renderBuildStatusBadge, () => {
  given({ label: 'build', status: 'passed' }).expect({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })
  given({ label: 'build', status: 'success' }).expect({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })
  given({ label: 'build', status: 'failed' }).expect({
    label: 'build',
    message: 'failing',
    color: 'red',
  })
  given({ label: 'build', status: 'error' }).expect({
    label: 'build',
    message: 'error',
    color: 'red',
  })
})

test(renderBuildStatusBadge, () => {
  forCases([
    given({ status: 'passed' }),
    given({ status: 'passing' }),
    given({ status: 'success' }),
  ]).assert('should be brightgreen', b =>
    expect(b).to.include({ color: 'brightgreen' })
  )
})

test(renderBuildStatusBadge, () => {
  forCases([
    given({ status: 'error' }),
    given({ status: 'failed' }),
    given({ status: 'failing' }),
    given({ status: 'unstable' }),
  ]).assert('should be red', b => expect(b).to.include({ color: 'red' }))
})

test(renderBuildStatusBadge, () => {
  forCases([
    given({ status: 'building' }),
    given({ status: 'cancelled' }),
    given({ status: 'expired' }),
    given({ status: 'no tests' }),
    given({ status: 'not built' }),
    given({ status: 'not run' }),
    given({ status: 'pending' }),
    given({ status: 'processing' }),
    given({ status: 'queued' }),
    given({ status: 'running' }),
    given({ status: 'scheduled' }),
    given({ status: 'skipped' }),
    given({ status: 'stopped' }),
    given({ status: 'timeout' }),
    given({ status: 'waiting' }),
  ]).assert('should have undefined color', b =>
    expect(b).to.include({ color: undefined })
  )
})
