# Issue #8944 Solution Plan

Issue: [Support ability to disable Dynamic and Endpoint badges for self-hosters](https://github.com/badges/shields/issues/8944)

Status: Phase II plan only. Production work is waiting for current maintainer direction.

## Understand

Dynamic and Endpoint badges are intentionally open ended. A caller supplies the URL that Shields fetches, then the badge returns data from that response. On an internet-facing self-hosted instance that can reach private services, this can expose data the administrator did not intend to publish.

The requested feature is a self-hosting control. It does not change the official `img.shields.io` deployment, and it is not a general SSRF fix.

Historical maintainer discussion supports an opt-out that stays enabled by default for compatibility. My July 24 claim comment asked whether that direction is still current and whether one shared switch or two controls are preferred. No maintainer has replied yet.

The provisional acceptance criteria are:

1. Dynamic and Endpoint routes remain available when an operator does not override the default or sets the value to `true`.
2. One self-hosting setting can disable both route families.
3. Disabled service classes never call `register()`, so their handlers cannot fetch a caller-supplied URL.
4. Disabled requests use Shields' existing unmatched-route badge response.
5. Other service families and the Prometheus metrics endpoint are unchanged.
6. The default, environment variable, runtime behavior, and disabled response are documented.
7. Focused tests prove both the default and disabled cases.

Items 2 and 4 are provisional until a maintainer replies.

## Match

### Registration ownership

`Server.registerServices()` is the shared runtime boundary. It already owns the loop that calls `serviceClass.register()` and has access to `config.public`. `loadServiceClasses()` should continue discovering and validating every service class. It already decorates each class with a directory-derived `serviceFamily`, which provides stable values for `dynamic` and `endpoint`.

This means the filter can use repository domain data instead of a list of class names:

```js
const openEndedServiceFamilies = new Set(['dynamic', 'endpoint'])
```

When the setting is disabled, `Server.registerServices()` skips classes whose `serviceFamily` is in that set. Every other class follows the current registration path.

### Configuration history

Commit `817b04794f`, `Add allowUnsecuredEndpointRequests config option for [Endpoint]`, is the closest configuration change. It added:

- a required boolean to `publicConfigSchema`;
- an enabled or disabled value in `config/default.yml`;
- behavior tests around the option.

The proposed control also needs an entry in `config/custom-environment-variables.yml` because this feature is meant for self-hosted operators.

### Configuration-gated route example

The Prometheus `endpointEnabled` option is a nearby configuration-gated handler example. `Server.start()` passes it to `PrometheusMetrics.registerMetricsEndpoint()`. The `/metrics` route is always mounted, but its handler returns HTTP 404 when the setting is false. That option controls the metrics endpoint, not the Endpoint badge.

There is no current example that filters ordinary service classes by configuration. The new code should stay small and local to `Server.registerServices()` instead of treating the metrics handler as an exact match.

### Git history and blame

`git blame` shows that the current lines for the service-registration loop and the loader's `serviceFamily` decoration were last reshaped by commit `23c0406bedf`, the July 2021 CommonJS-to-ESM migration. Those responsibilities existed before that migration. Later commits changed surrounding configuration and service behavior without moving them. This supports keeping discovery in the loader and runtime registration policy in the server.

## Plan

### 1. Add the public setting

Use this provisional shared shape:

```yaml
public:
  dynamicAndEndpointBadgesEnabled: true
```

Add `dynamicAndEndpointBadgesEnabled` as a required boolean in `publicConfigSchema`. Add the default value `true` in `config/default.yml` and map the environment variable `DYNAMIC_AND_ENDPOINT_BADGES_ENABLED` in `config/custom-environment-variables.yml`.

The default preserves every existing deployment. A self-hoster opts out by setting the value to `false`.

The maintainer may prefer a different name or two independent values. Do not write this production change until the project confirms the direction. Tuesday is the date to escalate the question in Discord, not permission to implement.

### 2. Suppress registration by service family

Update `Server.registerServices()` in `core/server/server.js`.

1. Load and validate all service classes as it does now.
2. When `dynamicAndEndpointBadgesEnabled` is `false`, exclude classes whose `serviceFamily` is `dynamic` or `endpoint`.
3. Call `register()` on the remaining classes through the existing path.

Do not put this policy in `loadServiceClasses()`. The loader is also used by tooling that needs to discover service definitions, while the server owns which routes are mounted for one runtime configuration.

Do not add checks to `DynamicJson.fetch()` or `Endpoint.handle()`. A handler check happens after route matching and duplicates the same policy in two families.

### 3. Keep the existing disabled response

Do not register replacement Dynamic or Endpoint routes. A disabled request falls through to the existing `camp.notfound` handler in `core/server/server.js`. For JSON badge requests, that handler returns the normal `404 | badge not found` badge payload.

This is different from a special `disabled by administrator` response. A special response would require another route or a handler-level flag, which would keep part of the disabled surface mounted. If maintainers request that behavior, treat it as a deliberate design change and add tests for it.

### 4. Add focused server tests

Extend `core/server/server.spec.js` or add a focused nearby suite using the existing server test helpers.

Cover these cases:

1. With the setting `true`, the JSON, regex, TOML, XML, and YAML Dynamic routes are registered.
2. With the setting `true`, the Endpoint route and the retired Endpoint compatibility route follow the maintainer-approved behavior.
3. With the setting `false`, all five Dynamic requests get the normal unmatched-route response.
4. With the setting `false`, the Endpoint request and retired compatibility request follow the approved disabled behavior.
5. With the setting `false`, an ordinary badge route still works.
6. Configuration validation accepts booleans and rejects an invalid value.
7. `DYNAMIC_AND_ENDPOINT_BADGES_ENABLED=true` and `false` both reach the validated public configuration as booleans.

Where practical, use a controlled fake URL and assert that it receives no request in the disabled cases. This proves the security boundary, not only the badge text.

### 5. Document self-hosting behavior

Update `doc/self-hosting.md` with:

- the YAML key and environment variable;
- the enabled-by-default compatibility rule;
- the fact that both Dynamic and Endpoint badge routes are affected;
- the normal unmatched-route response when disabled;
- the scope boundary that this does not disable fixed service routes.

Keep generated badge definitions unchanged. They describe what Shields supports as a project, while this setting controls which routes one self-hosted runtime mounts. Revisit this if maintainers want disabled services removed from a self-hosted API or route listing.

## Implement

Phase III is on hold. After maintainer direction, start with one failing server-level test for disabled registration, make the smallest change that passes it, and continue one behavior at a time.

The Phase II `codepath/` files are course evidence. Remove them from the final upstream pull-request diff before requesting review.

## Review

Before committing production code:

- confirm the shared-versus-separate setting decision with current maintainers;
- confirm the setting name and disabled-route response;
- verify that filtering uses `serviceFamily`, not class names or route strings;
- check that all non-target service classes still register;
- make sure `metrics.prometheus.endpointEnabled` is untouched;
- confirm the default remains enabled;
- review configuration schema, default YAML, environment mapping, tests, and self-hosting documentation as one contract;
- inspect the upstream PR diff and remove all `codepath/` course files.

Use separate standards and specification reviews before the production commit.

## Evaluate

Run the focused tests first:

```bash
source /Users/aziz.u/.nvm/nvm.sh
nvm use 24.15.0
npx cross-env TZ=UTC NODE_CONFIG_ENV=test mocha core/server/server.spec.js
```

Then run the relevant repository checks:

```bash
npm run test:core
npm run lint
npm run prettier:check
npm run defs
git diff --check
```

The final evidence must show:

- both route families work with the default configuration;
- neither route family mounts when disabled;
- disabled requests do not reach the fake upstream API;
- an ordinary badge route still works;
- the documented environment value reaches the validated public config;
- no unrelated source, generated definition, or documentation changed.

## Edge cases and pending decisions

- **One shared switch or two:** This plan uses one switch because the issue treats both open-ended families as one risk boundary. A maintainer may want independent controls.
- **Disabled response:** This plan uses the normal unmatched-route response. A special response would reveal that the route exists and needs substitute routing.
- **No operator override:** `config/default.yml` must supply `true` before the required Joi field is validated.
- **Environment parsing:** The strings `true` and `false` must become booleans through the existing `config` package mapping.
- **Unknown service family:** Every family outside `dynamic` and `endpoint` must still register.
- **Whole-family scope:** `dynamic` covers the JSON, regex, TOML, XML, and YAML services. Tests should prove the switch covers all five routes, not only the JSON route used in the reproduction.
- **Retired Endpoint route:** The `endpoint` family also contains the retired `/badge/endpoint` compatibility service. The maintainers need to confirm whether disabling the family should remove that compatibility route. The tests must record the chosen behavior.
- **Generated definitions:** Discovery can still list the project-supported routes even when one runtime does not mount them.
- **HTTPS is not the boundary:** Endpoint's existing `allowUnsecuredEndpointRequests` only controls HTTP URLs. HTTPS endpoints can still point to reachable private services, so it does not replace this feature.
- **General SSRF protection:** Network allowlists, DNS rebinding defenses, and private-address filtering are outside issue #8944.
- **No maintainer response:** Wait through Tuesday, July 28. If there is still no reply, ask once in the Shields Discord contributor channel and link the issue comment. Keep production code paused until the project confirms current interest and scope.
