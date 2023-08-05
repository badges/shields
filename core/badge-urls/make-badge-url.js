// Avoid "Attempted import error: 'URL' is not exported from 'url'" in frontend.
import url from 'url'

function rasterRedirectUrl({ rasterUrl }, badgeUrl) {
  // Ensure we're always using the `rasterUrl` by using just the path from
  // the request URL.
  const { pathname, search } = new url.URL(badgeUrl, 'https://bogus.test')
  const result = new url.URL(pathname, rasterUrl)
  result.search = search
  return result
}

export { rasterRedirectUrl }
