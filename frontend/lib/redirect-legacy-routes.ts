import { navigate } from 'gatsby'

export default function redirectLegacyRoutes() {
  const { hash } = window.location
  if (hash && hash.startsWith('#/examples/')) {
    const category = hash.replace('#/examples/', '')
    navigate(`category/${category}`, {
      replace: true,
    })
  } else if (hash === '#/endpoint') {
    navigate('endpoint', {
      replace: true,
    })
  }
}
