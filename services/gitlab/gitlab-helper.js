const description = `
You may use your GitLab Project Id (e.g. 278964) or your Project Path (e.g.
[gitlab-org/gitlab](https://gitlab.com/gitlab-org/gitlab) ).
Note that only internet-accessible GitLab instances are supported, for example
[https://jihulab.com](https://jihulab.com),
[https://gitlab.gnome.org](https://gitlab.gnome.org), or
[https://gitlab.com](https://gitlab.com).
`

function httpErrorsFor(notFoundMessage = 'project not found') {
  return {
    401: notFoundMessage,
    404: notFoundMessage,
  }
}

export { description, httpErrorsFor }
