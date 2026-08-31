/**
 * Joi validators that are shared across more than one service's tests.
 * Validators which are only used by one service should be declared in
 * that service's test file.
 *
 * @module
 */

import Joi from 'joi'
import { semver as isSemver } from './validators.js'

/**
 * Creates a Joi string validator that matches the given regular expression.
 *
 * @param {RegExp} re Regular expression the string must match
 * @returns {Joi.StringSchema} Joi string schema validating against the regex
 */
const withRegex = re => Joi.string().regex(re)

/**
 * Validates a version string with three dotted numeric clauses prefixed
 * by `v`, e.g. `v1.2.3`.
 *
 * @type {Joi.StringSchema}
 */
const isVPlusTripleDottedVersion = withRegex(/^v[0-9]+.[0-9]+.[0-9]+$/)

/**
 * Validates a version string prefixed by `v` with at least a major version
 * and optional minor and patch numbers, e.g. `v1`, `v1.2`, or `v1.2.3`.
 *
 * @type {Joi.StringSchema}
 */
const isVPlusDottedVersionAtLeastOne = withRegex(/^v\d+(\.\d+)?(\.\d+)?$/)

/**
 * Validates a version number prefixed by `v` with N 'clauses',
 * e.g. `v1.2` or `v1.22.7.392`.
 *
 * @type {Joi.StringSchema}
 */
const isVPlusDottedVersionNClauses = withRegex(/^v\d+(\.\d+)*$/)

/**
 * Validates a version number prefixed by `v` with N 'clauses' and an
 * optional text suffix, e.g. `-beta`, `-preview1`, `-release-candidate`,
 * `+beta`, or `~pre9-12`.
 *
 * @type {Joi.StringSchema}
 */
const isVPlusDottedVersionNClausesWithOptionalSuffix = withRegex(
  /^v\d+(\.\d+)*([-+~].*)?$/,
)

/**
 * Same as {@link isVPlusDottedVersionNClausesWithOptionalSuffix}, but also
 * accepts an optional 'epoch' prefix that can be found e.g. in distro
 * package versions, like `4:6.3.0-4`.
 *
 * @type {Joi.StringSchema}
 */
const isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch = withRegex(
  /^v(\d+:)?\d+(\.\d+)*([-+~].*)?$/,
)

/**
 * Simple regex for testing Composer version rules, e.g. `7.1`, `>=5.6`,
 * `>1.0 <2.0`, `!=1.0 <1.1 || >=1.2`, `7.1.*`, or `7.* || 5.6.*`.
 * This regex does not support branches, minimum-stability, ref, or any (`*`).
 *
 * @see https://getcomposer.org/doc/articles/versions.md
 * @see https://getcomposer.org/doc/04-schema.md#package-links
 * @see https://getcomposer.org/doc/04-schema.md#minimum-stability
 * @type {Joi.StringSchema}
 */
const isComposerVersion = withRegex(
  /^\*|(\s*(>=|>|<|<=|!=|\^|~)?\d+(\.(\*|(\d+(\.(\d+|\*))?)))?((\s*\|*)?\s*(>=|>|<|<=|!=|\^|~)?\d+(\.(\*|(\d+(\.(\d+|\*))?)))?)*\s*)$/,
)

/**
 * Validates the reduced PHP version string produced by
 * `php-version.versionReduction()`, e.g. `>= 7`, `>= 7.1`,
 * `5.4, 5.6, 7.2`, or `5.4 - 7.1, HHVM`.
 *
 * @type {Joi.StringSchema}
 */
const isPhpVersionReduction = withRegex(
  /^((>= \d+(\.\d+)?)|(\d+\.\d+(, \d+\.\d+)*)|(\d+\.\d+ - \d+\.\d+))(, HHVM)?$/,
)

/**
 * Validates a short or full git commit hash (7 to 40 hexadecimal characters).
 *
 * @type {Joi.StringSchema}
 */
const isCommitHash = withRegex(/^[a-f0-9]{7,40}$/)

/**
 * Validates a 5-character star rating string composed of full, fractional,
 * and empty star glyphs, e.g. `★★★¾☆`.
 *
 * @type {Joi.StringSchema}
 */
const isStarRating = withRegex(
  /^(?=.{5}$)(\u2605{0,5}[\u00BC\u00BD\u00BE]?\u2606{0,5})$/,
)

/**
 * Validates a metric-formatted positive number, e.g. `10`, `1k`, or `2.5M`.
 * Required to be > 0, because accepting zero masks many problems.
 *
 * @type {Joi.StringSchema}
 */
const isMetric = withRegex(/^([1-9][0-9]*[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY])$/)

/**
 * Same as {@link isMetric}, but also accepts zero and negative numbers,
 * e.g. `0`, `-1k`, or `-2.5M`.
 *
 * @type {Joi.StringSchema}
 */
const isMetricAllowNegative = withRegex(
  /^(0|-?[1-9][0-9]*[kMGTPEZY]?|-?[0-9]\.[0-9][kMGTPEZY])$/,
)

/**
 * Creates a validator that matches a metric (see {@link isMetric}) followed
 * by another pattern, e.g. ` open` or `/year`.
 *
 * @param {RegExp} nestedRegexp Pattern that must appear after the metric
 * @returns {Joi.StringSchema} Joi string schema for the combined pattern
 */
const isMetricWithPattern = nestedRegexp => {
  const pattern = `^([1-9][0-9]*[kMGTPEZY]?|[1-9]\\.[1-9][kMGTPEZY])${nestedRegexp.source}$`
  const regexp = new RegExp(pattern)
  return withRegex(regexp)
}

/**
 * Validates a metric followed by ` open`, e.g. `3 open` or `1.2k open`.
 *
 * @type {Joi.StringSchema}
 */
const isMetricOpenIssues = isMetricWithPattern(/ open/)

/**
 * Validates a metric followed by ` closed`, e.g. `3 closed` or `1.2k closed`.
 *
 * @type {Joi.StringSchema}
 */
const isMetricClosedIssues = isMetricWithPattern(/ closed/)

/**
 * Validates a metric followed by `/` and another metric, e.g. `3/10` or `1.2k/5k`.
 *
 * @type {Joi.StringSchema}
 */
const isMetricOverMetric = isMetricWithPattern(
  /\/([1-9][0-9]*[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY])/,
)

/**
 * Validates a metric followed by `/` and a time period, e.g. `3/day` or `1.2k/month`.
 *
 * @type {Joi.StringSchema}
 */
const isMetricOverTimePeriod = isMetricWithPattern(
  /\/(year|month|four weeks|quarter|week|day)/,
)

/**
 * Validates a literal zero followed by `/` and a time period, e.g. `0/day` or `0/year`.
 *
 * @type {Joi.StringSchema}
 */
const isZeroOverTimePeriod = withRegex(
  /^0\/(year|month|four weeks|quarter|week|day)$/,
)

/**
 * Validates a non-negative integer percentage, e.g. `0%`, `75%`, or `100%`.
 *
 * @type {Joi.StringSchema}
 */
const isIntegerPercentage = withRegex(/^[1-9][0-9]?%|^100%|^0%$/)
/**
 * Same as {@link isIntegerPercentage}, but also accepts negative values, e.g. `-25%`.
 *
 * @type {Joi.StringSchema}
 */
const isIntegerPercentageNegative = withRegex(/^-?[1-9][0-9]?%|^100%|^0%$/)
/**
 * Validates a non-negative decimal percentage, e.g. `0.5%` or `12.34%`.
 *
 * @type {Joi.StringSchema}
 */
const isDecimalPercentage = withRegex(/^[0-9]+\.[0-9]*%$/)
/**
 * Same as {@link isDecimalPercentage}, but also accepts negative values, e.g. `-0.5%`.
 *
 * @type {Joi.StringSchema}
 */
const isDecimalPercentageNegative = withRegex(/^-?[0-9]+\.[0-9]*%$/)
/**
 * Validates any percentage string by combining {@link isIntegerPercentage},
 * {@link isDecimalPercentage}, {@link isIntegerPercentageNegative}, and
 * {@link isDecimalPercentageNegative}.
 *
 * @type {Joi.AlternativesSchema}
 */
const isPercentage = Joi.alternatives().try(
  isIntegerPercentage,
  isDecimalPercentage,
  isIntegerPercentageNegative,
  isDecimalPercentageNegative,
)

/**
 * Validates a metric (SI) file size, e.g. `1 B`, `12.5 kB`, or `2 MB`.
 *
 * @type {Joi.StringSchema}
 */
const isMetricFileSize = withRegex(
  /^[0-9]*[.]?[0-9]+\s(B|kB|KB|MB|GB|TB|PB|EB|ZB|YB)$/,
)
/**
 * Validates an IEC (binary) file size, e.g. `1 B`, `12.5 KiB`, or `2 MiB`.
 *
 * @type {Joi.StringSchema}
 */
const isIecFileSize = withRegex(
  /^[0-9]*[.]?[0-9]+\s(B|KiB|MiB|GiB|TiB|PiB|EiB|ZiB|YiB)$/,
)

/**
 * Validates a human-readable formatted date, such as `today`, `yesterday`,
 * `last tuesday`, or `january 2021`.
 *
 * @type {Joi.AlternativesSchema}
 */
const isFormattedDate = Joi.alternatives().try(
  Joi.equal('today', 'yesterday'),
  Joi.string().regex(/^last (sun|mon|tues|wednes|thurs|fri|satur)day$/),
  Joi.string().regex(
    /^(january|february|march|april|may|june|july|august|september|october|november|december)( \d{4})?$/,
  ),
)

/**
 * Validates a relative formatted date, e.g. `2 days ago`, `in 3 months`,
 * or `a few seconds ago`.
 *
 * @type {Joi.AlternativesSchema}
 */
const isRelativeFormattedDate = Joi.alternatives().try(
  Joi.string().regex(
    /^(in |)([0-9]+|a few|a|an|)(| )(second|minute|hour|day|month|year)(s|)( ago|)$/,
  ),
)

/**
 * Validates a dependency state string, e.g. `up to date`, `3 out of date`,
 * or `2 deprecated`.
 *
 * @type {Joi.StringSchema}
 */
const isDependencyState = withRegex(
  /^(\d+ out of date|\d+ deprecated|up to date)$/,
)

/**
 * Creates a validator for test totals in the format
 * `<n> <passed>(, <n> <failed>)?(, <n> <skipped>)?`, e.g. `5 passed, 1 failed`.
 *
 * @param {object} labels Label strings used for each outcome
 * @param {string} labels.passed Label for passing tests
 * @param {string} labels.failed Label for failing tests
 * @param {string} labels.skipped Label for skipped tests
 * @returns {Joi.StringSchema} Joi string schema for the test totals format
 */
const makeTestTotalsValidator = ({ passed, failed, skipped }) =>
  withRegex(
    new RegExp(`^[0-9]+ ${passed}(, [0-9]+ ${failed})?(, [0-9]+ ${skipped})?$`),
  )

/**
 * Creates a validator for test totals in the compact format
 * `<passed> <n>( | <failed> <n>)?( | <skipped> <n>)?`, e.g. `✔ 5 | ✘ 1`.
 *
 * @param {object} labels Label strings used for each outcome
 * @param {string} labels.passed Label for passing tests
 * @param {string} labels.failed Label for failing tests
 * @param {string} labels.skipped Label for skipped tests
 * @returns {Joi.StringSchema} Joi string schema for the compact test totals format
 */
const makeCompactTestTotalsValidator = ({ passed, failed, skipped }) =>
  withRegex(
    new RegExp(
      `^${passed} [0-9]+( \\| ${failed} [0-9]+)?( \\| ${skipped} [0-9]+)?$`,
    ),
  )

/**
 * Validates a default test totals string with the labels `passed`, `failed`,
 * and `skipped`, e.g. `5 passed, 1 failed, 2 skipped`.
 *
 * @type {Joi.StringSchema}
 */
const isDefaultTestTotals = makeTestTotalsValidator({
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
})
/**
 * Validates a default compact test totals string with the glyph labels
 * `✔`, `✘`, and `➟`, e.g. `✔ 5 | ✘ 1 | ➟ 2`.
 *
 * @type {Joi.StringSchema}
 */
const isDefaultCompactTestTotals = makeCompactTestTotalsValidator({
  passed: '✔',
  failed: '✘',
  skipped: '➟',
})
/**
 * Validates a custom test totals string with the labels `good`, `bad`, and
 * `n/a`, e.g. `5 good, 1 bad, 2 n/a`.
 *
 * @type {Joi.StringSchema}
 */
const isCustomTestTotals = makeTestTotalsValidator({
  passed: 'good',
  failed: 'bad',
  skipped: 'n/a',
})
/**
 * Validates a custom compact test totals string with the emoji labels
 * `💃`, `🤦‍♀️`, and `🤷`, e.g. `💃 5 | 🤦‍♀️ 1 | 🤷 2`.
 *
 * @type {Joi.StringSchema}
 */
const isCustomCompactTestTotals = makeCompactTestTotalsValidator({
  passed: '💃',
  failed: '🤦‍♀️',
  skipped: '🤷',
})

/**
 * Validates an ordinal number string with a superscript suffix, e.g. `1ˢᵗ`, `2ⁿᵈ`, or `11ᵗʰ`.
 *
 * @type {Joi.StringSchema}
 */
const isOrdinalNumber = Joi.string().regex(/^[1-9][0-9]*(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/)
/**
 * Same as {@link isOrdinalNumber}, but followed by ` daily`, e.g. `1ˢᵗ daily`.
 *
 * @type {Joi.StringSchema}
 */
const isOrdinalNumberDaily = Joi.string().regex(
  /^[1-9][0-9]*(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/,
)

/**
 * Validates a humanized duration string, e.g. `3 days`, `1 hour`, or `2 years`.
 *
 * @type {Joi.StringSchema}
 */
const isHumanized = Joi.string().regex(
  /[0-9a-z]+ (second|seconds|minute|minutes|hour|hours|day|days|month|months|year|years)/,
)

/**
 * Validates a currency amount string with an optional `$` prefix, thousands
 * separators, and up to two decimal places. For example, `$1,530,602.24` and
 * `1,530,602.24` are valid, while `$1,666.24$`, `,1,666,88,`, `1.6.66,6`, and
 * `.1555.` are not.
 *
 * @type {Joi.StringSchema}
 */
const isCurrency = withRegex(
  /(?=.*\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|0)?(\.\d{1,2})?$/,
)

export {
  isSemver,
  isVPlusTripleDottedVersion,
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  isComposerVersion,
  isPhpVersionReduction,
  isCommitHash,
  isStarRating,
  isMetric,
  isMetricAllowNegative,
  isMetricWithPattern,
  isMetricOpenIssues,
  isMetricClosedIssues,
  isMetricOverMetric,
  isMetricOverTimePeriod,
  isZeroOverTimePeriod,
  isPercentage,
  isIntegerPercentage,
  isDecimalPercentage,
  isMetricFileSize,
  isIecFileSize,
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
  isOrdinalNumber,
  isOrdinalNumberDaily,
  isHumanized,
  isCurrency,
}
