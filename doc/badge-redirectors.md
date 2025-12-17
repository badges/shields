# Badge Redirectors

When a badge URL pattern needs to change, we should ensure that existing badges continue to work. This is achieved through redirectors, which automatically redirect old URLs to their new equivalents.

Redirectors issue HTTP 301 (permanent redirect) responses, allowing browsers and clients to follow the redirect to the new URL while maintaining backward compatibility for all existing badge usages.

## Creating a Redirector

Redirectors are created using the `redirector()` function from `core/base-service/redirector.js`.

### Required Properties

Every redirector must specify:

- **`category`** - The badge category (e.g. `'build'`, `'version'`, `'downloads'`). [Here](https://github.com/badges/shields/blob/master/services/categories.js) is the list of valid categories.
- **`route`** - An object defining the old URL pattern to match:
  - `base` - The first part of the old URL path
  - `pattern` - The variable part of the route (using [path-to-regexp](https://github.com/pillarjs/path-to-regexp) syntax)
- **`transformPath`** - A function that transforms the old path parameters into the new badge path
- **`dateAdded`** - The date when this redirector was added (e.g., `new Date('2025-11-23')`)

### Optional Properties

- **`name`** - Custom name for the service class (auto-generated from route if not specified)
- **`transformQueryParams`** - A function to transform path parameters into query parameters
- **`overrideTransformedQueryParams`** - Boolean (default: `false`). When `true`, query params from the URL take precedence over transformed params in case of conflicts
- **`isDeprecated`** - Boolean (default: `true`). Set to `false` for non-deprecated redirectors that should appear in the API documentation
- **`openApi`** - OpenAPI documentation object. Only needed for non-deprecated redirectors (`isDeprecated: false`) that should appear in the user-facing documentation

## Examples

### Example 1: Simple Path Redirect

When simply redirecting from an old URL pattern to a new one:

```js
import { redirector } from '../index.js'

export default redirector({
  category: 'other',
  route: {
    base: 'badge/endpoint',
    pattern: '',
  },
  transformPath: () => '/endpoint',
  dateAdded: new Date('2025-01-01'),
})
```

This redirects `/badge/endpoint` to `/endpoint`.

### Example 2: Redirecting with Path Parameters

When the old URL has parameters that need to be mapped to a new structure:

```js
import { redirector } from '../index.js'

export default redirector({
  category: 'analysis',
  route: {
    base: 'scrutinizer',
    pattern: ':vcs(g|b)/:user/:repo/:branch*',
  },
  transformPath: ({ vcs, user, repo, branch }) =>
    `/scrutinizer/quality/${vcs}/${user}/${repo}${branch ? `/${branch}` : ''}`,
  dateAdded: new Date('2025-02-02'),
})
```

This redirects patterns like `/scrutinizer/g/user/repo` to `/scrutinizer/quality/g/user/repo`.

### Example 3: Converting Path Parameters to Query Parameters

When migrating from path-based to query-based parameters:

```js
import { redirector } from '../index.js'

export default redirector({
  category: 'monitoring',
  route: {
    base: 'website',
    pattern: ':protocol(https|http)/:hostAndPath+',
  },
  transformPath: () => '/website',
  transformQueryParams: ({ protocol, hostAndPath }) => ({
    url: `${protocol}://${hostAndPath}`,
  }),
  dateAdded: new Date('2025-03-03'),
})
```

This redirects `/website/https/example.com` to `/website?url=https://example.com`.

### Example 4: Handling Query Parameter Conflicts

When both path-based and query-string parameters exist, conflicts can occur. By default, transformed query parameters take precedence over user-provided ones.
Use `overrideTransformedQueryParams: true` to reverse this behavior and let user-provided query parameters win:

```js
import { redirector } from '../index.js'

export default redirector({
  category: 'build',
  route: {
    base: 'old/service',
    pattern: 'token/:token/:param',
  },
  transformPath: ({ param }) => `/new/service/${param}`,
  transformQueryParams: ({ token }) => ({ token }),
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2025-04-04'),
})
```

If a user specifies `/old/service/token/abc123/foo?token=xyz789`, `xyz789` takes precedence due to `overrideTransformedQueryParams: true`.

### Example 5: Non-Deprecated Redirector with Documentation

In some cases, a badged based on a redirector may not be deprecated and should appear on the website. This requires setting `isDeprecated: false` and providing an `openApi` specification:

```js
import { redirector, pathParam } from '../index.js'
import { commonParams } from '../maven-metadata/maven-metadata.js'

export default redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'gradle-plugin-portal/v',
    pattern: ':pluginId',
  },
  openApi: {
    '/gradle-plugin-portal/v/{pluginId}': {
      get: {
        summary: 'Gradle Plugin Portal Version',
        parameters: [
          pathParam({ name: 'pluginId', example: 'com.gradle.plugin-publish' }),
          ...commonParams,
        ],
      },
    },
  },
  transformPath: () => '/maven-metadata/v',
  transformQueryParams: ({ pluginId }) => ({
    metadataUrl: `https://plugins.gradle.org/m2/...`,
    label: 'plugin portal',
  }),
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2025-05-05'),
})
```

This pattern is uncommon and should only be used when the redirect is part of the public API rather than a legacy compatibility layer.

## File Naming Convention

Redirectors should preferably be specified in a separate file named using the `*-redirect.service.js` pattern, and placed in the appropriate service directory. For example:

```
services/
  npm/
    my-service.service.js
    my-service.tester.js
    my-service-redirect.service.js
    my-service-redirect.tester.js
```

## Testing Redirectors

### Basic Test Structure

Tests for redirectors should verify that the old URL correctly redirects to the new URL.

Example redirect tests from `npm-downloads.tester.js`:

```js
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Total downloads redirect: unscoped package')
  .get('/dt/left-pad.svg')
  .expectRedirect('/npm/d18m/left-pad.svg')

t.create('Total downloads redirect: scoped package')
  .get('/dt/@cycle/core.svg')
  .expectRedirect('/npm/d18m/@cycle/core.svg')
```

The `expectRedirect()` helper verifies that:

- The response is an HTTP 301 (permanent redirect)
- The `Location` header points to the expected new URL

### Running Redirector Tests

Run tests the same way as other service tests:

```bash
npm run test:services -- --only=npm
```

Or for more specific tests:

```bash
npm run test:services -- --only=npm --fgrep="redirect"
```

## What Happens Next?

We'll keep the redirector for a minimum of one year. It may stay in place for significantly longer, and can only be sunset if one or both of the following conditions are met:

- The redirector led to less than 100 badge renders on a weekday.
- The redirector serves less than 1% of the traffic of the new badge URL it points to.

It can then be removed and replaced with a deprecated badge linking to an issue that explains the migration path, for example:

```js
import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'github/workflow/status',
    pattern: ':various+',
  },
  label: 'githubworkflowstatus',
  issueUrl: 'https://github.com/badges/shields/issues/8671',
  dateAdded: new Date('2025-11-29'),
})
```

Doing so will render badges similar to the following: ![](https://img.shields.io/badge/githubworkflowstatus-https%3A%2F%2Fgithub.com%2Fbadges%2Fshields%2Fissues%2F8671-red)

Removal of the resulting deprecated badge follows the process documented [here](./deprecating-badges.md).
