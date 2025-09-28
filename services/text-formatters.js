/**
 * Commonly-used functions for formatting text in badge labels. Includes
 * ordinal numbers, currency codes, star ratings, versions, etc.
 *
 * @module
 */

/**
 * Creates a string of stars and empty stars based on the rating.
 * The number of stars is determined by the integer part of the rating.
 * An additional star or a three-quarter star or a half star or a quarter star is added based on the decimal part of the rating.
 * The remaining stars are empty stars until the maximum number of stars is reached.
 *
 * @param {number} rating - Current rating
 * @param {number} [max] - Maximum rating
 * @returns {string} A string of stars and empty stars
 */
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

/**
 * Converts the ISO 4217 code to the corresponding currency symbol.
 * If the the symbol for the code is not found, then the code itself is returned.
 *
 * @param {string} code - ISO 4217 code
 * @returns {string} Currency symbol for the code
 */
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

/**
 * Calculates the ordinal number of the given number.
 * For example, if the input is 1, the output is “1ˢᵗ”.
 *
 * @param {number} n - Input number
 * @returns {string} Ordinal number of the input number
 */
function ordinalNumber(n) {
  const s = ['ᵗʰ', 'ˢᵗ', 'ⁿᵈ', 'ʳᵈ']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const metricPrefix = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
const metricPower = metricPrefix.map((a, i) => Math.pow(1000, i + 1))

/**
 * Given a number (positive or negative), returns a string with appropriate unit in the metric system, SI.
 * Note: numbers beyond the peta- cannot be represented as integers in JS.
 * For example, if you call metric(1000), it will return "1k", which means one kilo or one thousand.
 *
 * @param {number} n - Input number
 * @returns {string} String with appropriate unit in the metric system, SI
 */
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

/**
 * Remove the starting v in a string if it exists.
 * For example, omitv("v1.2.3") returns "1.2.3", but omitv("hello") returns "hello".
 *
 * @param {string} version - Version string
 * @returns {string} Version string without the starting v
 */
function omitv(version) {
  if (version.charCodeAt(0) === 118) {
    return version.slice(1)
  }
  return version
}

const ignoredVersionPatterns =
  /^[^0-9]|[0-9]{4}-[0-9]{2}-[0-9]{2}|^[a-f0-9]{7,40}$/

/**
 * Add a starting v to the version unless it doesn't starts with a digit, is a date (yyyy-mm-dd), or is a commit hash.
 * For example, addv("1.2.3") returns "v1.2.3", but addv("hello"), addv("2021-10-31"), addv("abcdef1"), returns "hello", "2021-10-31", and "abcdef1" respectively.
 *
 * @param {string} version - Version string
 * @returns {string} Version string with the starting v
 */
function addv(version) {
  version = `${version}`
  if (version.startsWith('v') || ignoredVersionPatterns.test(version)) {
    return version
  } else {
    return `v${version}`
  }
}

/**
 * Returns a string that is either the singular or the plural form of a word,
 * depending on the length of the countable parameter.
 *
 * @param {string} singular - Singular form of the word
 * @param {string[]} countable - Array of values you want to count
 * @param {string} plural - Plural form of the word
 * @returns {string} Singular or plural form of the word
 */
function maybePluralize(singular, countable, plural) {
  plural = plural || `${singular}s`

  if (countable && countable.length === 1) {
    return singular
  } else {
    return plural
  }
}

export {
  starRating,
  currencyFromCode,
  ordinalNumber,
  metric,
  omitv,
  addv,
  maybePluralize,
}
