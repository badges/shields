import { test, given } from 'sazerac'
import { renderDownloadsBadge } from './downloads.js'
import { downloadCount } from './color-formatters.js'
import { metric } from './text-formatters.js'

const downloads = 2345
const message = metric(downloads)
const color = downloadCount(downloads)

describe('downloads', function () {
  test(renderDownloadsBadge, () => {
    given({ downloads }).expect({ label: undefined, color, message })
    given({ downloads, labelOverride: 'recent downloads' }).expect({
      label: 'recent downloads',
      color,
      message,
    })
    given({ downloads, version: 'v1.0.0' }).expect({
      label: 'downloads@v1.0.0',
      color,
      message,
    })
    given({
      downloads,
      versionedLabelPrefix: 'installs',
      version: 'v1.0.0',
    }).expect({
      label: 'installs@v1.0.0',
      color,
      message,
    })
    given({
      downloads,
      messageSuffixOverride: '[foo.tar.gz]',
      interval: 'week',
    }).expect({
      label: undefined,
      color,
      message: `${message} [foo.tar.gz]`,
    })
    given({ downloads, interval: 'year' }).expect({
      label: undefined,
      color,
      message: `${message}/year`,
    })
    given({ downloads, colorOverride: 'pink' }).expect({
      label: undefined,
      color: 'pink',
      message,
    })
  })
})
