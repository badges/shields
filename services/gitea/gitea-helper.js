const description = `
By default this badge looks for repositories on [gitea.com](https://gitea.com).
To specify another instance like [codeberg](https://codeberg.org/), [forgejo](https://forgejo.org/) or a self-hosted instance, use the \`gitea_url\` query param.
`

function httpErrorsFor() {
  return {
    403: 'private repo',
    404: 'user or repo not found',
  }
}

export { description, httpErrorsFor }
