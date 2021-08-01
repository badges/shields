import Joi from 'joi'

const testResultQueryParamSchema = Joi.object({
  compact_message: Joi.equal(''),
  passed_label: Joi.string(),
  failed_label: Joi.string(),
  skipped_label: Joi.string(),
}).required()

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
<p>
  You may change the "passed", "failed" and "skipped" text on this badge by supplying query parameters <code>&passed_label=</code>, <code>&failed_label=</code> and <code>&skipped_label=</code> respectively.
</p>

<p>
  For example, if you want to use a different terminology:
  <br>
  <code>?passed_label=good&failed_label=bad&skipped_label=n%2Fa</code>
</p>

<p>
  Or symbols:
  <br>
  <code>?compact_message&passed_label=💃&failed_label=🤦‍♀️&skipped_label=🤷</code>
</p>

<p>
  There is also a <code>&compact_message</code> query parameter, which will default to displaying ✔, ✘ and ➟, separated by a horizontal bar |.
</p>
`

export {
  testResultQueryParamSchema,
  renderTestResultMessage,
  renderTestResultBadge,
  documentation,
}
