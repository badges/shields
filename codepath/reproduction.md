# Issue #8944 Reproduction

Issue: [Support ability to disable Dynamic and Endpoint badges for self-hosters](https://github.com/badges/shields/issues/8944)

Date reproduced: July 26, 2026

## Environment setup

- macOS on Apple Silicon
- Node.js v24.15.0 through nvm
- npm v11.12.1
- Fork: `azizu06/shields`
- Branch: `fix-issue-8944`
- Starting point: `upstream/master` at `f29362a33e`

I fetched the current upstream branch, created a separate worktree for issue #8944, selected Node 24.15.0, and ran `npm ci`. This reused my Shields fork while keeping Cycle 3 separate from older worktrees and their untracked files.

The first server attempt exposed a setup problem. My shell had switched to Node 26.4.0, but `node_modules/re2` had been compiled for Node 24. The process printed its configuration, then stopped with:

```text
Error: The module 'node_modules/re2/build/Release/re2.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 137. This version of Node.js requires
NODE_MODULE_VERSION 147.
Node.js v26.4.0
```

I resolved this by running the server with the same Node version used for the install:

```bash
source /Users/aziz.u/.nvm/nvm.sh
nvm use 24.15.0
node --version
```

The final command printed `v24.15.0`, and the server stayed up.

## Steps to reproduce

1. In the first terminal, start a controlled fake API. This keeps the reproduction away from real private systems. Leave it running while making both badge requests.

   ```bash
   node -e 'const http=require("node:http"); const server=http.createServer((req,res)=>{ console.log(`${req.method} ${req.url}`); res.setHeader("content-type","application/json"); if(req.url==="/dynamic"){res.end(JSON.stringify({secret:"internal-data"}))}else if(req.url==="/endpoint"){res.end(JSON.stringify({schemaVersion:1,label:"private",message:"internal-data",color:"blue"}))}else{res.statusCode=404;res.end(JSON.stringify({error:"not found"}))}}); server.listen(19091,"127.0.0.1",()=>console.log("fake-api-ready http://127.0.0.1:19091")); process.on("SIGTERM",()=>server.close())'
   ```

   Expected startup output:

   ```text
   fake-api-ready http://127.0.0.1:19091
   ```

2. In a second terminal, start Shields on another local port. The existing `allowUnsecuredEndpointRequests` setting is enabled only because the fake API uses local HTTP.

   ```bash
   source /Users/aziz.u/.nvm/nvm.sh
   nvm use 24.15.0
   NODE_CONFIG='{"public":{"allowUnsecuredEndpointRequests":true}}' \
     node server 19092 127.0.0.1
   ```

   Relevant startup output:

   ```text
   allowUnsecuredEndpointRequests: true
   Server is starting up: http://127.0.0.1:19092/
   ```

3. In a third terminal, request a Dynamic JSON badge. The supplied URL points at the fake document, and the JSONPath selects its `secret` field.

   ```bash
   curl --silent --show-error --get \
     'http://127.0.0.1:19092/badge/dynamic/json.json' \
     --data-urlencode 'url=http://127.0.0.1:19091/dynamic' \
     --data-urlencode 'query=$.secret'
   ```

   Actual response:

   ```text
   {"label":"custom badge","message":"internal-data","color":"blue","link":[],"name":"custom badge","value":"internal-data"}
   ```

4. Request an Endpoint badge backed by the second fake response.

   ```bash
   curl --silent --show-error --get \
     'http://127.0.0.1:19092/endpoint.json' \
     --data-urlencode 'url=http://127.0.0.1:19091/endpoint'
   ```

   Actual response:

   ```text
   {"label":"private","message":"internal-data","color":"blue","link":[],"name":"private","value":"internal-data"}
   ```

5. Check the first terminal. The fake API recorded both outbound requests from Shields:

   ```text
   GET /dynamic
   GET /endpoint
   ```

6. Press `Control-C` in the Shields terminal and the fake API terminal. Then verify that neither test port is still listening.

   ```bash
   for port in 19091 19092; do
     if lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
       echo "port $port still listening"
     else
       echo "port $port released"
     fi
   done
   ```

   Actual output:

   ```text
   port 19091 released
   port 19092 released
   ```

## Expected and observed behavior

**Observed:** Both route families accepted a caller-selected URL. Shields fetched that URL and returned the fake value in its badge response.

**Expected when the proposed route setting is `false`:** Neither route family is registered. The same requests should go to the existing unmatched-route handler and must not reach either badge handler or the fake API.

This reproduction proves the URL-fetching capability behind the issue. It does not claim that a real private network was attacked.

## Root cause and code trace

`loadServiceClasses()` in `core/base-service/loader.js` lines 46-71 finds every `*.service.js` module. Lines 67-69 assign each valid class a `serviceFamily` from its directory name, including `dynamic` and `endpoint`.

`Server.registerServices()` in `core/server/server.js` lines 470-492 loads that full list and calls `serviceClass.register()` for every class. There is no public setting or family check before registration.

Once registered:

- `DynamicJson` in `services/dynamic/dynamic-json.service.js` accepts `url` and `query`, fetches the supplied JSON document, and returns the selected value.
- `Endpoint` in `services/endpoint/endpoint.service.js` accepts `url`, fetches badge-shaped JSON, and renders it.

The missing control belongs at registration because that is the shared point before either route can run. Filtering inside the generic loader would mix self-hosting policy with service discovery. Filtering inside either handler would leave the route mounted and duplicate the policy across two service families.

## Files and functions involved

- `core/server/server.js`
  - `publicConfigSchema`
  - `Server.registerServices()`
  - the existing `camp.notfound` handler
- `core/base-service/loader.js`
  - `loadServiceClasses()`
  - the `serviceFamily` assignment
- `services/dynamic/dynamic-json.service.js`
  - `DynamicJson.route`
  - `DynamicJson.fetch()`
- `services/endpoint/endpoint.service.js`
  - `Endpoint.route`
  - `Endpoint.handle()`
- `config/default.yml`
- `config/custom-environment-variables.yml`
- `doc/self-hosting.md`
