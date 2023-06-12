# Badge URL Conventions

- The format of new badges should be of the form `/SERVICE/NOUN/PARAMETERS?QUERYSTRING` e.g:
  `/github/issues/:user/:repo`. The service is github, the
  badge is for issues, and the parameters are `:user/:repo`.
- The `NOUN` part of the route is:
  - singular if the badge message represents a single entity, such as the current status of a build (e.g: `/build`), or a more abstract or aggregate representation of the thing (e.g.: `/coverage`, `/quality`)
  - plural if there are (or may) be many of the thing (e.g: `/dependencies`, `/stars`)
- Parameters should always be part of the route if they are required to display a badge e.g: `:packageName`.
- Common optional params like, `:branch` or `:tag` should also be passed as part of the route.
- Query string parameters should be used when:
  - The parameter is related to formatting. e.g: `/appveyor/tests/:user/:repo?compact_message`.
  - The parameter is for an uncommon optional attribute, like an alternate registry URL.
  - The parameter triggers application of alternative logic, like version semantics. e.g: `/github/v/tag/:user/:repo?sort=semver`.
  - Services which require a url/hostname parameter always should use a query string parameter to accept that value. e.g: `/discourse/topics?server=https://meta.discourse.org`.

It is convention to use the following standard routes and abbreviations across services:

- Coverage: `/coverage`
- Downloads or Installs:
  - Total: `/dt` - Use this even for services that only provide the total download/install data
  - Per month: `/dm`
  - Per week: `/dw`
  - Per day: `/dd`
- Rating:
  - Numeric: `/rating`
  - Stars: `/stars`
- License: `/l`
- Version or Release: `/v`
