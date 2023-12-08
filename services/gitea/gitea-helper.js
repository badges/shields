const documentation = `
Note that only internet-accessible Gitea compatible instances are supported, for example
[https://codeberg.org](https://codeberg.org).
`

function httpErrorsFor(notFoundMessage = 'user or repo not found') {
  return {
    401: notFoundMessage,
    404: notFoundMessage,
  }
}

export { documentation, httpErrorsFor }
