// I played with build-url and url-resolve-browser and neither of them did the
// right thing. Previously this was based on url-path, which patched around
// the URL API. This caused problems in Firefox 57, but only in the production
// build.

// Let's rewrite these without a deprecated API!
// eslint-disable-next-line node/no-deprecated-api
import { resolve, parse, format } from 'url'

// baseUrl and queryParams are optional.
export default function resolveUrl(url, baseUrl, queryParams) {
  const resolved = baseUrl ? resolve(baseUrl, url) : url
  const parsed = parse(resolved, /* parseQueryString */ true)
  parsed.query = Object.assign({}, parsed.query, queryParams)
  delete parsed.search
  return format(parsed)
}
