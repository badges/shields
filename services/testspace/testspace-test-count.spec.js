import { test, given } from 'sazerac'
import TestspaceTestCount from './testspace-test-count.service.js'

describe('TestspaceTestCount', function () {
  test(TestspaceTestCount.render, () => {
    given({ metric: 'failed', value: 2 }).expect({
      label: 'failed tests',
      message: '2',
      color: 'critical',
    })
    given({ metric: 'errored', value: 3 }).expect({
      label: 'errored tests',
      message: '3',
      color: 'critical',
    })
    given({ metric: 'failed', value: 0 }).expect({
      label: 'failed tests',
      message: '0',
      color: 'success',
    })
    given({ metric: 'errored', value: 0 }).expect({
      label: 'errored tests',
      message: '0',
      color: 'success',
    })
    given({ metric: 'passed', value: 1 }).expect({
      label: 'passed tests',
      message: '1',
      color: 'informational',
    })
    given({ metric: 'total', value: 8 }).expect({
      label: 'total tests',
      message: '8',
      color: 'informational',
    })
    given({ metric: 'skipped', value: 0 }).expect({
      label: 'skipped tests',
      message: '0',
      color: 'informational',
    })
  })
})
