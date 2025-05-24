/**
 * Commonly-used functions for rendering badges containing a date
 *
 * @module
 */

import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import localeData from 'dayjs/plugin/localeData.js'
import updateLocale from 'dayjs/plugin/updateLocale.js'
import { colorScale } from './color-formatters.js'
import { InvalidResponse } from './index.js'

dayjs.extend(calendar)
dayjs.extend(customParseFormat)
dayjs.extend(localeData)
dayjs.extend(updateLocale)

/**
 * Parse and validate a string date into a dayjs object. Use this helper
 * in preference to invoking dayjs directly when parsing a date from string.
 *
 * @param {...any} args - Variadic: Arguments to pass through to dayjs
 * @returns {dayjs} - Parsed object
 * @throws {InvalidResponse} - Error if validation fails
 * @see https://day.js.org/docs/en/parse/string
 * @see https://day.js.org/docs/en/parse/string-format
 * @see https://day.js.org/docs/en/parse/is-valid
 * @example
 * parseDate('2024-01-01')
 * parseDate('31/01/2024', 'DD/MM/YYYY')
 * parseDate('2018 Enero 15', 'YYYY MMMM DD', 'es')
 */
function parseDate(...args) {
  let date
  if (args.length >= 2) {
    // always use strict mode if format arg is supplied
    date = dayjs(...args, true)
  } else {
    date = dayjs(...args)
  }
  if (!date.isValid()) {
    throw new InvalidResponse({ prettyMessage: 'invalid date' })
  }
  return date
}

/**
 * Format a date according to the specified locale
 *
 * @param {Date} date - The date to format
 * @param {string} locale - The locale to use for formatting
 * @returns {string} The formatted date string
 */
async function formatDate(date, locale) {
  if (
    date === null ||
    date === undefined ||
    (typeof date === 'string' && date.trim() === '')
  ) {
    return 'Invalid date'
  }
  let parsed
  try {
    parsed = parseDate(date)
  } catch (e) {
    return 'Invalid date'
  }

  // Set locale if provided
  if (locale) {
    try {
      // Load the locale if it exists
      // const localeModule = await import(`dayjs/locale/${locale}.js`)
      dayjs.locale(locale)
    } catch (e) {
      // If locale loading fails, fall back to default locale
      console.warn(`Failed to load locale ${locale}, falling back to default`)
    }
  }

  if (date instanceof Date) {
    // If it's January 1st of the current year, return just the month
    const now = dayjs()
    if (
      parsed.month() === 0 &&
      parsed.date() === 1 &&
      parsed.year() === now.year()
    ) {
      return parsed.format('MMMM').toLowerCase()
    }
    return parsed.format('YYYY-MM-DD')
  }
  if (typeof date === 'number') {
    return parsed.format('MMMM YYYY').toLowerCase()
  }
  return parsed.format('MMMM YYYY').toLowerCase()
}

/**
 * Determines the color used for a badge according to the age.
 * Age is calculated as days elapsed till current date.
 * The color varies from bright green to red as the age increases
 * or the other way around if `reverse` is given `true`.
 *
 * @param {Date | string | number | dayjs } date JS Date object, string, unix timestamp or dayjs object
 * @param {boolean} reversed Reverse the color scale (the older, the better)
 * @returns {string} Badge color
 */
function age(date, reversed = false) {
  const colorByAge = colorScale([7, 30, 180, 365, 730], undefined, !reversed)
  const daysElapsed = dayjs().diff(parseDate(date), 'days')
  return colorByAge(daysElapsed)
}

/**
 * Creates a badge object that displays a date
 *
 * @param {Date | string | number | dayjs } date JS Date object, string, unix timestamp or dayjs object
 * @param {boolean} reversed Reverse the color scale (the older, the better)
 * @param {string} [locale] The locale to use for formatting (e.g. 'en', 'fr', 'de')
 * @returns {Promise<object>} A badge object that has two properties: message, and color
 */
async function renderDateBadge(date, reversed = false, locale) {
  const d = parseDate(date)
  const color = age(d, reversed)
  const message = await formatDate(d, locale)
  return { message, color }
}

/**
 * Returns a relative date from the input timestamp.
 * For example, day after tomorrow's timestamp will return 'in 2 days'.
 *
 * @param {number | string} timestamp - Unix timestamp
 * @returns {string} Relative date from the unix timestamp
 */
function formatRelativeDate(timestamp) {
  const parsedDate = dayjs.unix(parseInt(timestamp, 10))
  if (!parsedDate.isValid()) {
    return 'invalid date'
  }
  return dayjs().to(parsedDate).toLowerCase()
}

function isValidDate(date) {
  if (date === null || date === undefined) return false
  try {
    const parsed = dayjs(date)
    return parsed.isValid() && !isNaN(parsed.valueOf()) && date !== 'invalid'
  } catch (e) {
    return false
  }
}

export {
  parseDate,
  renderDateBadge,
  formatDate,
  formatRelativeDate,
  age,
  isValidDate,
}
