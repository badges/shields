// Avoid "Attempted import error: 'URL' is not exported from 'url'" in frontend.
import url from 'url'

/**
 * Build a redirect URL for the raster (non-SVG) badge variant. Preserves the
 * path and query string from the original badge request.
 *
 * @param {object} options - Options for the redirect.
 * @param {string} options.rasterUrl - Base URL for raster badge rendering.
 * @param {string} badgeUrl - The original badge request URL.
 * @returns {string} Redirect URL pointing to the raster endpoint.
 */
function rasterRedirectUrl({ rasterUrl }, badgeUrl) {
  // Ensure we're always using the `rasterUrl` by using just the path from
  // the request URL.
  const { pathname, search } = new url.URL(badgeUrl, 'https://bogus.test')
  const result = new url.URL(pathname, rasterUrl)
  result.search = search
  return result
}

export { rasterRedirectUrl }
