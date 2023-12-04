const documentation = `
Note that the gitea_url parameter is required because there is no gitea hosted service by Gitea themselves.`

function httpErrorsFor(notFoundMessage = 'user or repo not found') {
  return {
    401: notFoundMessage,
    404: notFoundMessage,
  }
}

export { documentation, httpErrorsFor }
