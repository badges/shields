/**
 * Commonly-used functions for determining the colour to use for a badge,
 * including colours based off download count, version number, etc.
 *
 * @module
 */

import pep440 from '@renovatebot/pep440'
import dayjs from 'dayjs'

/**
 * Determines the color used for a badge based on version.
 *
 * @param {string|number} version Version used for determining badge color
 * @returns {string} Badge color
 */
function version(version) {
  if (typeof version !== 'string' && typeof version !== 'number') {
    throw new Error(`Can't generate a version color for ${version}`)
  }
  version = `${version}`
  let first = version[0]
  if (first === 'v') {
    first = version[1]
  }
  if (first === '0' || /alpha|beta|snapshot|dev|pre|rc/i.test(version)) {
    return 'orange'
  } else {
    return 'blue'
  }
}

/**
 * Determines the color used for a badge based on PEP440 versioning.
 *
 * @param {string|number} version Version used for determining badge color
 * @returns {string} Badge color
 */
function pep440VersionColor(version) {
  if (!pep440.valid(version)) {
    return 'lightgrey'
  }
  const parsedVersion = pep440.explain(version)
  if (parsedVersion.is_prerelease || parsedVersion.public.startsWith('0.')) {
    return 'orange'
  }
  return 'blue'
}

/**
 * Determines the color used for a badge by comparing the value and floor count values.
 * The color can vary from red to bright green depending on the range the value lies in.
 * Decreasing the value will shift the color towards red.
 * Increasing the value will shift the color towards bright green.
 *
 * @param {number} value Current value
 * @param {number} yellow Yellow color threshold, should be greater than 0
 * @param {number} yellowgreen Yellowgreen color threshold, should be greater than yellow
 * @param {number} green Green color threshold, should be greater than yellowgreen
 * @returns {string} Badge color
 */
function floorCount(value, yellow, yellowgreen, green) {
  if (value <= 0) {
    return 'red'
  } else if (value < yellow) {
    return 'yellow'
  } else if (value < yellowgreen) {
    return 'yellowgreen'
  } else if (value < green) {
    return 'green'
  } else {
    return 'brightgreen'
  }
}

/**
 * Determines the color used for a badge by comparing the download count and floor values.
 * The color varies from red to bright green as the download count increases.
 *
 * @param {number} downloads Download count
 * @returns {string} Badge color
 */
function downloadCount(downloads) {
  return floorCount(downloads, 10, 100, 1000)
}

/**
 * Determines the color used for a badge by comparing percentage and floor values.
 * The color varies from red to bright green as the percentage increases.
 *
 * @param {number} percentage Percentage value
 * @returns {string} Badge color
 */
function coveragePercentage(percentage) {
  return floorCount(percentage, 80, 90, 100)
}

/**
 * Determines the color used for a badge by matching score with grade values.
 * The color varies from bright green to red as the score decreases.
 * The score can be one of the following grade value: ['A', 'B', 'C', 'D', 'E'].
 * The color defaults to red if the score does not matches with any of the grade values.
 *
 * @param {string} score Score value
 * @returns {string} Badge color
 */
function letterScore(score) {
  if (score === 'A') {
    return 'brightgreen'
  } else if (score === 'B') {
    return 'green'
  } else if (score === 'C') {
    return 'yellowgreen'
  } else if (score === 'D') {
    return 'yellow'
  } else if (score === 'E') {
    return 'orange'
  } else {
    return 'red'
  }
}

/**
 * Creates a callback function that determines badge color from the colors array.
 * If the colors array is provided then for n steps, there should be n + 1 color.
 * If the colors array is not provided then it is chosen from the default colors array
 * according to the size of the steps array.
 *
 * @param {number[]} steps Steps array
 * @param {string[]} colors Colors array. If provided, should be of length steps.length + 1
 * @param {boolean} reversed If true then the colors array will be considered in reverse order
 * @returns {function(number): string} Function that finds the step index by comparing value
 * with steps array and returns color from colors array for the corresponding step index
 */
function colorScale(steps, colors, reversed) {
  if (steps === undefined) {
    throw Error('When invoking colorScale, steps should be provided.')
  }

  const defaultColors = {
    1: ['red', 'brightgreen'],
    2: ['red', 'yellow', 'brightgreen'],
    3: ['red', 'yellow', 'green', 'brightgreen'],
    4: ['red', 'yellow', 'yellowgreen', 'green', 'brightgreen'],
    5: ['red', 'orange', 'yellow', 'yellowgreen', 'green', 'brightgreen'],
  }

  if (typeof colors === 'undefined') {
    if (steps.length in defaultColors) {
      colors = defaultColors[steps.length]
    } else {
      throw Error(`No default colors for ${steps.length} steps.`)
    }
  }

  if (steps.length !== colors.length - 1) {
    throw Error(
      'When colors are provided, there should be n + 1 colors for n steps.',
    )
  }

  if (reversed) {
    colors = Array.from(colors).reverse()
  }

  return value => {
    const stepIndex = steps.findIndex(step => value < step)

    // For the final step, stepIndex is -1, so in all cases this expression
    // works swimmingly.
    return colors.slice(stepIndex)[0]
  }
}

/**
 * Determines the color used for a badge according to the age.
 * Age is calculated as days elapsed till current date.
 * The color varies from bright green to red as the age increases
 * or the other way around if `reverse` is given `true`.
 *
 * @param {string} date Date string
 * @param {boolean} reversed Reverse the color scale a.k.a. the older, the better
 * @returns {string} Badge color
 */
function age(date, reversed = false) {
  const colorByAge = colorScale([7, 30, 180, 365, 730], undefined, !reversed)
  const daysElapsed = dayjs().diff(dayjs(date), 'days')
  return colorByAge(daysElapsed)
}

export {
  age,
  colorScale,
  coveragePercentage,
  downloadCount,
  floorCount,
  letterScore,
  pep440VersionColor,
  version,
}
