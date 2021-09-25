import { expect } from 'chai'
import { test, given, forCases } from 'sazerac'
import { renderBuildStatusBadge } from './build-status.js'

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
  given({ label: 'build', status: 'partially succeeded' }).expect({
    label: 'build',
    message: 'passing',
    color: 'orange',
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
    given({ status: 'fixed' }),
    given({ status: 'passed' }),
    given({ status: 'passing' }),
    given({ status: 'succeeded' }),
    given({ status: 'success' }),
    given({ status: 'successful' }),
  ]).assert('should be brightgreen', b =>
    expect(b).to.include({ color: 'brightgreen' })
  )
})

test(renderBuildStatusBadge, () => {
  forCases([
    given({ status: 'partially succeeded' }),
    given({ status: 'timeout' }),
    given({ status: 'unstable' }),
  ]).assert('should be orange', b => expect(b).to.include({ color: 'orange' }))
})

test(renderBuildStatusBadge, () => {
  forCases([
    given({ status: 'broken' }),
    given({ status: 'error' }),
    given({ status: 'errored' }),
    given({ status: 'failed' }),
    given({ status: 'failing' }),
    given({ status: 'failure' }),
    given({ status: 'infrastructure_failure' }),
  ]).assert('should be red', b => expect(b).to.include({ color: 'red' }))
})

test(renderBuildStatusBadge, () => {
  forCases([
    given({ status: 'building' }),
    given({ status: 'canceled' }),
    given({ status: 'cancelled' }),
    given({ status: 'expired' }),
    given({ status: 'initiated' }),
    given({ status: 'no builds' }),
    given({ status: 'no tests' }),
    given({ status: 'not built' }),
    given({ status: 'not run' }),
    given({ status: 'pending' }),
    given({ status: 'processing' }),
    given({ status: 'queued' }),
    given({ status: 'running' }),
    given({ status: 'scheduled' }),
    given({ status: 'skipped' }),
    given({ status: 'starting' }),
    given({ status: 'stopped' }),
    given({ status: 'testing' }),
    given({ status: 'waiting' }),
  ]).assert('should have undefined color', b =>
    expect(b).to.include({ color: undefined })
  )
})
