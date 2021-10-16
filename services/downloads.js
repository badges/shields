import { downloadCount } from './color-formatters.js'
import { metric } from './text-formatters.js'

function renderDownloadsBadge({
  downloads,
  interval,
  version,
  labelOverride,
  colorOverride,
  messageSuffixOverride,
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
    label = `downloads@${version}`
  }

  return {
    label,
    color: colorOverride || downloadCount(downloads),
    message: `${metric(downloads)}${messageSuffix}`,
  }
}

export { renderDownloadsBadge }
