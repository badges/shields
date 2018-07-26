on('pull_request.closed')
  .filter(context => context.payload.pull_request.merged)
  .filter(context => context.payload.pull_request.base.ref === 'master')
  .comment(`This pull request was merged to [{{ pull_request.base.ref }}]({{ repository.html_url }}/tree/{{ pull_request.base.ref }}) branch. Now this change is waiting for deployment. 
Deploys usually happen every few weeks. After deployment changes are copied to [gh-pages]({{ repository.html_url }}/tree/gh-pages) branch. 

This badge displays deployment status:
![](https://img.shields.io/github/commit-status/{{ repository.full_name }}/gh-pages/{{ pull_request.merge_commit_sha }}.svg?label=deploy%20status)`)
