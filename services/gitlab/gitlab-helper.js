const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 278964) or your Project Path (e.g. 
  <a href="https://gitlab.com/gitlab-org/gitlab" target="_blank" >gitlab-org/gitlab</a> ).
  Note that only internet-accessible GitLab instances are supported, for example 
  <a href="https://jihulab.com" target="_blank" >https://jihulab.com</a>, 
  <a href="https://gitlab.gnome.org" target="_blank" >https://gitlab.gnome.org</a>, or 
  <a href="https://gitlab.com" target="_blank" >https://gitlab.com</a>.
</p>
`

function errorMessagesFor(notFoundMessage = 'project not found') {
  return {
    401: notFoundMessage,
    404: notFoundMessage,
  }
}

export { documentation, errorMessagesFor }
