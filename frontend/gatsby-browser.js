import redirectLegacyRoutes from './lib/redirect-legacy-routes'

// Adapted from https://github.com/gatsbyjs/gatsby/issues/8413
function scrollToElementId(id) {
  const el = document.querySelector(id)
  if (el) {
    return window.scrollTo(0, el.offsetTop - 20)
  } else {
    return false
  }
}

export function onRouteUpdate({ location: { hash } }) {
  if (hash) {
    redirectLegacyRoutes()
    window.setTimeout(() => scrollToElementId(hash), 10)
  }
}
