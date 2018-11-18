'use strict'

/*
  Note:
  Validators defined in this file are used by more than one service.
  Validators which are only used by one service
  should be declared in that service's test file.
*/

const Joi = require('joi').extend(require('joi-extension-semver'))

const withRegex = re => Joi.string().regex(re)

const isSemver = Joi.semver().valid()

const isVPlusTripleDottedVersion = withRegex(/^v[0-9]+.[0-9]+.[0-9]+$/)

const isVPlusDottedVersionAtLeastOne = withRegex(/^v\d+(\.\d+)?(\.\d+)?$/)

// matches a version number with N 'clauses' e.g: v1.2 or v1.22.7.392 are valid
const isVPlusDottedVersionNClauses = withRegex(/^v\d+(\.\d+)*$/)

// matches a version number with N 'clauses'
// and an optional text suffix
// e.g: -beta, -preview1, -release-candidate etc
const isVPlusDottedVersionNClausesWithOptionalSuffix = withRegex(
  /^v\d+(\.\d+)*(-.*)?$/
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
  /^((>= \d+(\.\d+)?)|(\d+\.\d+(, \d+\.\d+)*)|(\d+\.\d+ \\- \d+\.\d+))(, HHVM)?$/
)

const isStarRating = withRegex(
  /^(?=.{5}$)(\u2605{0,5}[\u00BC\u00BD\u00BE]?\u2606{0,5})$/
)

// Required to be > 0, because accepting zero masks many problems.
const isMetric = withRegex(/^[1-9][0-9]*[kMGTPEZY]?$/)

const isMetricOpenIssues = withRegex(/^[1-9][0-9]*[kMGTPEZY]? open$/)

const isMetricOverTimePeriod = withRegex(
  /^[1-9][0-9]*[kMGTPEZY]?\/(year|month|4 weeks|week|day)$/
)

const isIntegerPercentage = withRegex(/^[1-9][0-9]?%|^100%|^0%$/)
const isDecimalPercentage = withRegex(/^[0-9]+\.[0-9]*%$/)
const isPercentage = Joi.alternatives().try(
  isIntegerPercentage,
  isDecimalPercentage
)

const isFileSize = withRegex(/^[0-9]*[.]?[0-9]+\s(B|kB|MB|GB|TB|PB|EB|ZB|YB)$/)

const isFormattedDate = Joi.alternatives().try(
  Joi.equal('today', 'yesterday'),
  Joi.string().regex(/^last (sun|mon|tues|wednes|thurs|fri|satur)day$/),
  Joi.string().regex(
    /^(january|february|march|april|may|june|july|august|september|october|november|december)( \d{4})?$/
  )
)

const isDependencyState = withRegex(
  /^(\d+ out of date|\d+ deprecated|up to date)$/
)

const isBuildStatus = Joi.equal(
  'building',
  'cancelled',
  'error',
  'expired',
  'failed',
  'failing',
  'no tests',
  'not built',
  'not run',
  'passed',
  'passing',
  'pending',
  'processing',
  'queued',
  'running',
  'scheduled',
  'skipped',
  'stopped',
  'success',
  'timeout',
  'unstable',
  'waiting'
)

module.exports = {
  isSemver,
  isVPlusTripleDottedVersion,
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isComposerVersion,
  isPhpVersionReduction,
  isStarRating,
  isMetric,
  isMetricOpenIssues,
  isMetricOverTimePeriod,
  isPercentage,
  isIntegerPercentage,
  isDecimalPercentage,
  isFileSize,
  isFormattedDate,
  isDependencyState,
  isBuildStatus,
  withRegex,
}
