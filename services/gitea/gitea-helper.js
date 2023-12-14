const documentation = `
Note that only internet-accessible Gitea compatible instances are supported, for example
[https://codeberg.org](https://codeberg.org).
`

function httpErrorsFor() {
  return {
    403: 'private repo',
    404: 'user or repo not found',
  }
}

export { documentation, httpErrorsFor }
