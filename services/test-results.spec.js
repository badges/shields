import { test, given } from 'sazerac'
import {
  renderTestResultMessage,
  renderTestResultBadge,
} from './test-results.js'

describe('Test result helpers', function () {
  function renderBothStyles(props) {
    const { message: standardMessage, color } = renderTestResultBadge(props)
    const compactMessage = renderTestResultMessage({
      ...props,
      isCompact: true,
    })
    return { standardMessage, compactMessage, color }
  }

  test(renderBothStyles, () => {
    given({ passed: 12, failed: 3, skipped: 3, total: 18 }).expect({
      standardMessage: '12 passed, 3 failed, 3 skipped',
      compactMessage: '✔ 12 | ✘ 3 | ➟ 3',
      color: 'red',
    })
    given({ passed: 12, failed: 3, skipped: 0, total: 15 }).expect({
      standardMessage: '12 passed, 3 failed',
      compactMessage: '✔ 12 | ✘ 3',
      color: 'red',
    })
    given({ passed: 12, failed: 0, skipped: 3, total: 15 }).expect({
      standardMessage: '12 passed, 3 skipped',
      compactMessage: '✔ 12 | ➟ 3',
      color: 'green',
    })
    given({ passed: 0, failed: 0, skipped: 3, total: 3 }).expect({
      standardMessage: '0 passed, 3 skipped',
      compactMessage: '✔ 0 | ➟ 3',
      color: 'yellow',
    })
    given({ passed: 12, failed: 0, skipped: 0, total: 12 }).expect({
      standardMessage: '12 passed',
      compactMessage: '✔ 12',
      color: 'brightgreen',
    })
    given({ passed: 0, failed: 0, skipped: 0, total: 0 }).expect({
      standardMessage: 'no tests',
      compactMessage: 'no tests',
      color: 'yellow',
    })
  })
})
