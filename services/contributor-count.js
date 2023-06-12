/**
 * Common functions and utilities for tasks related to contributor count.
 *
 * @module
 */

import { metric } from './text-formatters.js'

/**
 * Determines the color used for a badge based on the contributor count.
 * The color varies from red to bright green as the contributor count increases.
 *
 * @param {number} contributorCount Contributor count
 * @returns {string} Badge color
 */
function contributorColor(contributorCount) {
  if (contributorCount > 2) {
    return 'brightgreen'
  } else if (contributorCount === 2) {
    return 'yellow'
  } else {
    return 'red'
  }
}

/**
 * Handles rendering concerns of badges that display contributor count.
 * Determines the message and color of the badge according to the contributor count.
 *
 * @param {object} attrs Refer to individual attributes
 * @param {string} [attrs.label] If provided then badge label is set to this value
 * @param {number} attrs.contributorCount Contributor count
 * @returns {object} Badge with label, message and color properties
 */
function renderContributorBadge({ label, contributorCount }) {
  return {
    label,
    message: metric(contributorCount),
    color: contributorColor(contributorCount),
  }
}

export { contributorColor, renderContributorBadge }
