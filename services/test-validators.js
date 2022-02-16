import Joi from 'joi'
import { semver as isSemver } from './validators.js'

/*
  Note:
  Validators defined in this file are used by more than one service.
  Validators which are only used by one service
  should be declared in that service's test file.
*/

const withRegex = re => Joi.string().regex(re)

const isVPlusTripleDottedVersion = withRegex(/^v[0-9]+.[0-9]+.[0-9]+$/)

const isVPlusDottedVersionAtLeastOne = withRegex(/^v\d+(\.\d+)?(\.\d+)?$/)

// matches a version number with N 'clauses' e.g: v1.2 or v1.22.7.392 are valid
const isVPlusDottedVersionNClauses = withRegex(/^v\d+(\.\d+)*$/)

// matches a version number with N 'clauses'
// and an optional text suffix
// e.g: -beta, -preview1, -release-candidate, +beta, ~pre9-12 etc
const isVPlusDottedVersionNClausesWithOptionalSuffix = withRegex(
  /^v\d+(\.\d+)*([-+~].*)?$/
)

// same as above, but also accepts an optional 'epoch' prefix that can be
// found e.g. in distro package versions, like 4:6.3.0-4
const isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch = withRegex(
  /^v(\d+:)?\d+(\.\d+)*([-+~].*)?$/
)

// Simple regex for test Composer versions rule
// https://getcomposer.org/doc/articles/versions.md
// Examples:
// 7.1
// >=5.6
// >1.0 <2.0
// !=1.0 <1.1 || >=1.2
// 7.1.*
// 7.* || 5.6.*
// This regex not support branches, minimum-stability, ref and any (*)
// https://getcomposer.org/doc/04-schema.md#package-links
// https://getcomposer.org/doc/04-schema.md#minimum-stability
const isComposerVersion = withRegex(
  /^\s*(>=|>|<|<=|!=|\^|~)?\d+(\.(\*|(\d+(\.(\d+|\*))?)))?((\s*\|\|)?\s*(>=|>|<|<=|!=|\^|~)?\d+(\.(\*|(\d+(\.(\d+|\*))?)))?)*\s*$/
)

// Regex for validate php-version.versionReduction()
// >= 7
// >= 7.1
// 5.4, 5.6, 7.2
// 5.4 - 7.1, HHVM
const isPhpVersionReduction = withRegex(
  /^((>= \d+(\.\d+)?)|(\d+\.\d+(, \d+\.\d+)*)|(\d+\.\d+ - \d+\.\d+))(, HHVM)?$/
)

const isStarRating = withRegex(
  /^(?=.{5}$)(\u2605{0,5}[\u00BC\u00BD\u00BE]?\u2606{0,5})$/
)

// Required to be > 0, because accepting zero masks many problems.
const isMetric = withRegex(/^([1-9][0-9]*[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY])$/)

// Same as isMetric, but tests for negative numbers also.
const isMetricAllowNegative = withRegex(
  /^(0|-?[1-9][0-9]*[kMGTPEZY]?|-?[0-9]\.[0-9][kMGTPEZY])$/
)

/**
 * @param {RegExp} nestedRegexp Pattern that must appear after the metric.
 * @returns {Function} A function that returns a RegExp that matches a metric followed by another pattern.
 */
const isMetricWithPattern = nestedRegexp => {
  const pattern = `^([1-9][0-9]*[kMGTPEZY]?|[1-9]\\.[1-9][kMGTPEZY])${nestedRegexp.source}$`
  const regexp = new RegExp(pattern)
  return withRegex(regexp)
}

const isMetricOpenIssues = isMetricWithPattern(/ open/)

const isMetricOverMetric = isMetricWithPattern(
  /\/([1-9][0-9]*[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY])/
)

const isMetricOverTimePeriod = isMetricWithPattern(
  /\/(year|month|four weeks|quarter|week|day)/
)

const isZeroOverTimePeriod = withRegex(
  /^0\/(year|month|four weeks|quarter|week|day)$/
)

const isIntegerPercentage = withRegex(/^[1-9][0-9]?%|^100%|^0%$/)
const isDecimalPercentage = withRegex(/^[0-9]+\.[0-9]*%$/)
const isPercentage = Joi.alternatives().try(
  isIntegerPercentage,
  isDecimalPercentage
)

const isFileSize = withRegex(
  /^[0-9]*[.]?[0-9]+\s(B|kB|KB|MB|GB|TB|PB|EB|ZB|YB)$/
)

const isFormattedDate = Joi.alternatives().try(
  Joi.equal('today', 'yesterday'),
  Joi.string().regex(/^last (sun|mon|tues|wednes|thurs|fri|satur)day$/),
  Joi.string().regex(
    /^(january|february|march|april|may|june|july|august|september|october|november|december)( \d{4})?$/
  )
)

const isRelativeFormattedDate = Joi.alternatives().try(
  Joi.string().regex(
    /^(in |)([0-9]+|a few|a|an|)(| )(second|minute|hour|day|month|year)(s|)( ago|)$/
  )
)

const isDependencyState = withRegex(
  /^(\d+ out of date|\d+ deprecated|up to date)$/
)

const makeTestTotalsValidator = ({ passed, failed, skipped }) =>
  withRegex(
    new RegExp(`^[0-9]+ ${passed}(, [0-9]+ ${failed})?(, [0-9]+ ${skipped})?$`)
  )

const makeCompactTestTotalsValidator = ({ passed, failed, skipped }) =>
  withRegex(
    new RegExp(
      `^${passed} [0-9]+( \\| ${failed} [0-9]+)?( \\| ${skipped} [0-9]+)?$`
    )
  )

const isDefaultTestTotals = makeTestTotalsValidator({
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
})
const isDefaultCompactTestTotals = makeCompactTestTotalsValidator({
  passed: '✔',
  failed: '✘',
  skipped: '➟',
})
const isCustomTestTotals = makeTestTotalsValidator({
  passed: 'good',
  failed: 'bad',
  skipped: 'n/a',
})
const isCustomCompactTestTotals = makeCompactTestTotalsValidator({
  passed: '💃',
  failed: '🤦‍♀️',
  skipped: '🤷',
})

export {
  isSemver,
  isVPlusTripleDottedVersion,
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  isComposerVersion,
  isPhpVersionReduction,
  isStarRating,
  isMetric,
  isMetricAllowNegative,
  isMetricWithPattern,
  isMetricOpenIssues,
  isMetricOverMetric,
  isMetricOverTimePeriod,
  isZeroOverTimePeriod,
  isPercentage,
  isIntegerPercentage,
  isDecimalPercentage,
  isFileSize,
  isFormattedDate,
  isRelativeFormattedDate,
  isDependencyState,
  withRegex,
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
  makeTestTotalsValidator,
  makeCompactTestTotalsValidator,
}
