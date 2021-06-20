/**
 * Commonly-used functions for determining the colour to use for a badge,
 * including colours based off download count, version number, etc.
 */
import moment from 'moment'

function version(version) {
  if (typeof version !== 'string' && typeof version !== 'number') {
    throw new Error(`Can't generate a version color for ${version}`)
  }
  version = `${version}`
  let first = version[0]
  if (first === 'v') {
    first = version[1]
  }
  if (first === '0' || /alpha|beta|snapshot|dev|pre/i.test(version)) {
    return 'orange'
  } else {
    return 'blue'
  }
}

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

function downloadCount(downloads) {
  return floorCount(downloads, 10, 100, 1000)
}

function coveragePercentage(percentage) {
  return floorCount(percentage, 80, 90, 100)
}

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
      'When colors are provided, there should be n + 1 colors for n steps.'
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

function age(date) {
  const colorByAge = colorScale([7, 30, 180, 365, 730], undefined, true)
  const daysElapsed = moment().diff(moment(date), 'days')
  return colorByAge(daysElapsed)
}

export {
  version,
  downloadCount,
  coveragePercentage,
  floorCount,
  letterScore,
  colorScale,
  age,
}
