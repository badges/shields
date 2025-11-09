# ComfyUI Registry badges

This document explains the usage and implementation notes for the ComfyUI Registry badges shipped in Shields.

Endpoints

- GET /comfyui/:node/downloads — number of downloads
- GET /comfyui/:node/version — latest published version
- GET /comfyui/:node/stars — GitHub stars (if available)

Example badge URLs (replace publisher and node):

- Downloads (JSON):
  - https://img.shields.io/comfyui/comfyui-image-captioner/downloads.json
  - Markdown example: `![downloads](https://img.shields.io/comfyui/comfyui-image-captioner/downloads)`

- Version (JSON):
  - https://img.shields.io/comfyui/comfyui-image-captioner/version.json
  - Markdown example: `![comfyui-image-captioner](https://img.shields.io/comfyui/comfyui-image-captioner/version)`
  - Note: the version badge label uses the node identifier (e.g. `comfyui-image-captioner`) to avoid ambiguity with the platform name.

- Stars (JSON):
  - https://img.shields.io/comfyui/comfyui-image-captioner/stars.json
  - Markdown example: `![stars](https://img.shields.io/comfyui/comfyui-image-captioner/stars)`

Behavior and caching

- The service queries the ComfyUI Registry API at `https://api.comfy.org/nodes/:node` and validates the returned JSON against a schema (required fields: `id`, `downloads`, `latest_version.version`).
- The service honors upstream `Cache-Control: max-age=<n>` when present and uses it as the TTL for the in-process cache.
- If upstream returns `Cache-Control: max-age=0` and provides an `ETag`, the service uses conditional GET (If-None-Match) to revalidate and avoid unnecessary full responses when possible.
- If upstream returns `max-age=0` and _no_ `ETag` is present, the service uses a conservative fallback TTL to avoid hammering the registry. The default fallback TTL is 60 seconds.
  - The fallback TTL can be overridden by the `COMFYUI_FALLBACK_TTL` environment variable (value in seconds).

Error mapping

- 404 from the upstream API maps to a Shields Not Found badge.
- 401/403 map to Inaccessible/unauthorized badges.
- Network or 5xx errors are retried with a small backoff; if retries are exhausted an Inaccessible badge is returned.

- Implementation notes for contributors
- Service source: `services/comfyui/comfyui-registry.service.js` — contains the fetch / caching logic and three service classes: `ComfyuiDownloads`, `ComfyuiVersion`, `ComfyuiStars`.
- Unit tests: `services/comfyui/comfyui-registry.spec.js` (nock-based tests cover ETag revalidation and fallback TTL behavior).
- To configure the fallback TTL locally for testing, set `COMFYUI_FALLBACK_TTL` before running tests:

```bash
export COMFYUI_FALLBACK_TTL=1
npm test services/comfyui-registry.spec.js
```

Troubleshooting

- If you see unexpected badge output such as `rate limited by upstream service`, inspect the upstream responses and network availability. Live integration tests in the repository may be flaky due to third-party rate limits.
