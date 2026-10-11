// These query parameters are available to any badge. They are handled by
// `coalesceBadge`.
const globalQueryParams = new Set([
  'label',
  'style',
  'link',
  'logo',
  'logoColor',
  'logoSize',
  'colorA',
  'colorB',
  'color',
  'labelColor',
])

function flattenQueryParams(queryParams) {
  const union = new Set(globalQueryParams)
  ;(queryParams || []).forEach(name => {
    union.add(name)
  })
  return Array.from(union).sort()
}

// For safety, the service must declare the query parameters it wants to use.
// Only the declared parameters (and the global parameters) are provided to
// the service. Consequently, failure to declare a parameter results in the
// parameter not working at all (which is undesirable, but easy to debug)
// rather than indeterminate behavior that depends on the cache state
// (undesirable and hard to debug).
function filterQueryParams(queryParams, allowedKeys) {
  const filteredQueryParams = {}
  allowedKeys.forEach(key => {
    filteredQueryParams[key] = queryParams[key]
  })
  return filteredQueryParams
}

export { globalQueryParams, flattenQueryParams, filterQueryParams }
