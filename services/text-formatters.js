/**
 * Commonly-used functions for formatting text in badge labels. Includes
 * ordinal numbers, currency codes, star ratings, versions, etc.
 */
import moment from 'moment'
moment().format()

function starRating(rating, max = 5) {
  const flooredRating = Math.floor(rating)
  let stars = ''
  while (stars.length < flooredRating) {
    stars += '★'
  }
  const decimal = rating - flooredRating
  if (decimal >= 0.875) {
    stars += '★'
  } else if (decimal >= 0.625) {
    stars += '¾'
  } else if (decimal >= 0.375) {
    stars += '½'
  } else if (decimal >= 0.125) {
    stars += '¼'
  }

  while (stars.length < max) {
    stars += '☆'
  }
  return stars
}

// Convert ISO 4217 code to unicode string.
function currencyFromCode(code) {
  return (
    {
      CNY: '¥',
      EUR: '€',
      GBP: '₤',
      USD: '$',
    }[code] || code
  )
}

function ordinalNumber(n) {
  const s = ['ᵗʰ', 'ˢᵗ', 'ⁿᵈ', 'ʳᵈ']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Given a number (positive or negative), string with appropriate unit in the metric system, SI.
// Note: numbers beyond the peta- cannot be represented as integers in JS.
const metricPrefix = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
const metricPower = metricPrefix.map((a, i) => Math.pow(1000, i + 1))
function metric(n) {
  for (let i = metricPrefix.length - 1; i >= 0; i--) {
    const limit = metricPower[i]
    const absN = Math.abs(n)
    if (absN >= limit) {
      const scaledN = absN / limit
      if (scaledN < 10) {
        // For "small" numbers, display one decimal digit unless it is 0.
        const oneDecimalN = scaledN.toFixed(1)
        if (oneDecimalN.charAt(oneDecimalN.length - 1) !== '0') {
          const res = `${oneDecimalN}${metricPrefix[i]}`
          return n > 0 ? res : `-${res}`
        }
      }
      const roundedN = Math.round(scaledN)
      if (roundedN < 1000) {
        const res = `${roundedN}${metricPrefix[i]}`
        return n > 0 ? res : `-${res}`
      } else {
        const res = `1${metricPrefix[i + 1]}`
        return n > 0 ? res : `-${res}`
      }
    }
  }
  return `${n}`
}

// Remove the starting v in a string.
function omitv(version) {
  if (version.charCodeAt(0) === 118) {
    return version.slice(1)
  }
  return version
}

// Add a starting v to the version unless:
// - it does not start with a digit
// - it is a date (yyyy-mm-dd)
const ignoredVersionPatterns = /^[^0-9]|[0-9]{4}-[0-9]{2}-[0-9]{2}/
function addv(version) {
  version = `${version}`
  if (version.startsWith('v') || ignoredVersionPatterns.test(version)) {
    return version
  } else {
    return `v${version}`
  }
}

function maybePluralize(singular, countable, plural) {
  plural = plural || `${singular}s`

  if (countable && countable.length === 1) {
    return singular
  } else {
    return plural
  }
}

function formatDate(d) {
  const date = moment(d)
  const dateString = date.calendar(null, {
    lastDay: '[yesterday]',
    sameDay: '[today]',
    lastWeek: '[last] dddd',
    sameElse: 'MMMM YYYY',
  })
  // Trim current year from date string
  return dateString.replace(` ${moment().year()}`, '').toLowerCase()
}

function formatRelativeDate(timestamp) {
  return moment()
    .to(moment.unix(parseInt(timestamp, 10)))
    .toLowerCase()
}

export {
  starRating,
  currencyFromCode,
  ordinalNumber,
  metric,
  omitv,
  addv,
  maybePluralize,
  formatDate,
  formatRelativeDate,
}
