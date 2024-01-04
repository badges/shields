const documentation = `
Note that only internet-accessible Gitea/Forgejo based instances are supported, for example https://gitea.com, https://codeberg.org.
For self-hosted instances, the gitea_url parameter is required.
`

function httpErrorsFor() {
  return {
    403: 'private repo',
    404: 'user or repo not found',
  }
}

export { documentation, httpErrorsFor }
