import Joi from 'joi'
import { queryParams } from './index.js'

const testResultQueryParamSchema = Joi.object({
  compact_message: Joi.equal(''),
  passed_label: Joi.string(),
  failed_label: Joi.string(),
  skipped_label: Joi.string(),
}).required()

const testResultOpenApiQueryParams = queryParams(
  {
    name: 'compact_message',
    example: null,
    schema: { type: 'boolean' },
  },
  { name: 'passed_label', example: 'good' },
  { name: 'failed_label', example: 'bad' },
  { name: 'skipped_label', example: 'n/a' },
)

function renderTestResultMessage({
  passed,
  failed,
  skipped,
  total,
  passedLabel,
  failedLabel,
  skippedLabel,
  isCompact,
}) {
  const labels = { passedLabel, failedLabel, skippedLabel }
  if (total === 0) {
    return 'no tests'
  } else if (isCompact) {
    ;({ passedLabel = '✔', failedLabel = '✘', skippedLabel = '➟' } = labels)
    return [
      `${passedLabel} ${passed}`,
      failed > 0 && `${failedLabel} ${failed}`,
      skipped > 0 && `${skippedLabel} ${skipped}`,
    ]
      .filter(Boolean)
      .join(' | ')
  } else {
    ;({
      passedLabel = 'passed',
      failedLabel = 'failed',
      skippedLabel = 'skipped',
    } = labels)
    return [
      `${passed} ${passedLabel}`,
      failed > 0 && `${failed} ${failedLabel}`,
      skipped > 0 && `${skipped} ${skippedLabel}`,
    ]
      .filter(Boolean)
      .join(', ')
  }
}

function renderTestResultBadge({
  passed,
  failed,
  skipped,
  total,
  passedLabel,
  failedLabel,
  skippedLabel,
  isCompact,
}) {
  const message = renderTestResultMessage({
    passed,
    failed,
    skipped,
    total,
    passedLabel,
    failedLabel,
    skippedLabel,
    isCompact,
  })

  let color
  if (total === 0) {
    color = 'yellow'
  } else if (failed > 0) {
    color = 'red'
  } else if (skipped > 0 && passed > 0) {
    color = 'green'
  } else if (skipped > 0) {
    color = 'yellow'
  } else {
    color = 'brightgreen'
  }

  return { message, color }
}

const documentation = `
You may change the "passed", "failed" and "skipped" text on this badge by supplying query parameters <code>&passed_label=</code>, <code>&failed_label=</code> and <code>&skipped_label=</code> respectively.

For example, if you want to use a different terminology:

\`?passed_label=good&failed_label=bad&skipped_label=n%2Fa\`

Or symbols:

\`?compact_message&passed_label=💃&failed_label=🤦‍♀️&skipped_label=🤷\`

There is also a <code>&compact_message</code> query parameter, which will default to displaying ✔, ✘ and ➟, separated by a horizontal bar |.
`

export {
  testResultQueryParamSchema,
  testResultOpenApiQueryParams,
  renderTestResultMessage,
  renderTestResultBadge,
  documentation,
}
