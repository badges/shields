const baseUrl = process.env.GATSBY_BASE_URL

export function getBaseUrl(): string {
  if (baseUrl) {
    return baseUrl
  }

  /*
  This is a special case for production.

  We want to be able to build the front end with no value set for
  `GATSBY_BASE_URL` so that we can deploy a build to staging
  and then promote the exact same build to production.

  When deployed to staging, we want the frontend on
  https://staging.shields.io/ to generate badges with the base
  https://staging.shields.io/

  When we promote to production we want https://shields.io/ and
  https://www.shields.io/ to both generate badges with the base
  https://img.shields.io/
  */
  try {
    const { protocol, hostname, port } = window.location
    if (['shields.io', 'www.shields.io'].includes(hostname)) {
      return 'https://img.shields.io'
    }
    return `${protocol}//${hostname}:${port}`
  } catch (e) {
    // server-side rendering
    return ''
  }
}
