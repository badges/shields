/**
 * @module
 */

import { downloadCount } from './color-formatters.js'
import { metric } from './text-formatters.js'

/**
 * Handles rendering concerns of badges that display
 * download counts, with override/customization support
 *
 * @param {object} attrs Refer to individual attrs
 * @param {number} attrs.downloads Number of downloads
 * @param {string} [attrs.interval] Period or interval the downloads occurred
 *    (e.g. day, week, month). If provided then this Will be reflected
 *    in the badge message unless overridden by other message-related parameters
 * @param {string} [attrs.version] Version or tag that was downloaded
 *    which will be reflected in the badge label (unless the label is overridden)
 * @param {string} [attrs.labelOverride] If provided then the badge label is set to this
 *    value overriding any other label-related parameters
 * @param {string} [attrs.colorOverride] If provided then the badge color is set to this
 *    value instead of the color being based on the count of downloads
 * @param {string} [attrs.messageSuffixOverride] If provided then the badge message will
 *    will have this value added to the download count, separated with a space
 * @param {string} [attrs.versionedLabelPrefix] If provided then the badge label will use
 *    this value as the prefix for versioned badges, e.g. `foobar@v1.23`. Defaults to 'downloads'
 * @returns {object} Badge
 */
function renderDownloadsBadge({
  downloads,
  interval,
  version,
  labelOverride,
  colorOverride,
  messageSuffixOverride,
  versionedLabelPrefix = 'downloads',
}) {
  let messageSuffix = ''
  if (messageSuffixOverride) {
    messageSuffix = ` ${messageSuffixOverride}`
  } else if (interval) {
    messageSuffix = `/${interval}`
  }

  let label
  if (labelOverride) {
    label = labelOverride
  } else if (version) {
    label = `${versionedLabelPrefix}@${version}`
  }

  return {
    label,
    color: colorOverride || downloadCount(downloads),
    message: `${metric(downloads)}${messageSuffix}`,
  }
}

export { renderDownloadsBadge }
