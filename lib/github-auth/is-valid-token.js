'use strict'

// This is only used by the TokenProviders, though probably the acceptor
// should use it too.

const isValidToken = t => /^[0-9a-f]{40}$/.test(t)

module.exports = isValidToken
