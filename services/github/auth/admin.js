import { makeSecretIsValid } from '../../../core/server/secret-is-valid.js'

function setRoutes({ shieldsSecret }, { apiProvider, server }) {
  const secretIsValid = makeSecretIsValid(shieldsSecret)

  // Allow the admin to obtain the tokens for operational and debugging
  // purposes. This could be used to:
  //
  // - Ensure tokens have been propagated to all servers
  // - Debug GitHub badge failures
  //
  // The admin can authenticate with HTTP Basic Auth, with an empty/any
  // username and the shields secret in the password and an empty/any
  // password.
  //
  // e.g.
  // curl --insecure -u ':very-very-secret' 'https://img.shields.io/$github-auth/tokens'
  server.ajax.on('github-auth/tokens', (json, end, ask) => {
    if (!secretIsValid(ask.password)) {
      // An unknown entity tries to connect. Let the connection linger for a minute.
      return setTimeout(() => {
        ask.res.statusCode = 401
        ask.res.setHeader('Cache-Control', 'private')
        end('Invalid secret.')
      }, 10000)
    }
    ask.res.setHeader('Cache-Control', 'private')
    end(apiProvider.serializeDebugInfo({ sanitize: false }))
  })
}

export { setRoutes }
