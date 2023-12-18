const documentation = `
Note that the gitea_url parameter is required because there is canonical hosted gitea service provided by Gitea.
`

function httpErrorsFor() {
  return {
    403: 'private repo',
    404: 'user or repo not found',
  }
}

export { documentation, httpErrorsFor }
