import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { renderVersionBadge } from '../version.js'
import {
  BaseJsonService,
  pathParams,
  NotFound,
  Inaccessible,
  InvalidResponse,
} from '../index.js'

const nodeSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().allow('', null),
  downloads: Joi.number().integer().min(0).required(),
  github_stars: Joi.number().integer().min(0).allow(null),
  latest_version: Joi.object({ version: Joi.string().required() }).required(),
}).required()

class BaseComfyuiService extends BaseJsonService {
  static category = 'other'

  // Prefer the API-provided cache header; default when absent
  static _cacheLength = 960

  // When upstream explicitly sets `max-age=0` but does not provide an ETag
  // we cannot perform conditional GET revalidation. Use a conservative
  // fallback TTL to avoid hammering upstream. This value can be overridden
  // via the environment variable `COMFYUI_FALLBACK_TTL` (seconds) if needed.
  static DEFAULT_FALLBACK_TTL = 60

  static _inflight = new Map()
  // Simple in-memory per-process cache for upstream responses. Stores objects:
  // { body, etag, lastModified, storedAt (ms), ttl (s) }
  static _memoryCache = new Map()

  // helper: parse Cache-Control max-age. Returns integer seconds or null.
  static parseMaxAge(cacheControl) {
    if (!cacheControl) return null
    const m = /max-age=(\d+)/i.exec(String(cacheControl))
    if (!m) return null
    const n = Number.parseInt(m[1], 10)
    return Number.isFinite(n) ? n : null
  }

  async fetchNode({ node }) {
    const key = String(node)
    if (this.constructor._inflight.has(key)) {
      return await this.constructor._inflight.get(key)
    }

    const p = (async () => {
      const url = `https://api.comfy.org/nodes/${encodeURIComponent(node)}`
      const maxRetries = 2
      let attempt = 0
      let delay = 200

      const cached = this.constructor._memoryCache.get(key)
      const now = Date.now()
      if (cached) {
        const ageMs = now - cached.storedAt
        if (cached.ttl > 0 && ageMs < cached.ttl * 1000) {
          return cached.body
        }
        // if ttl === 0 we keep the cached entry so we can attempt a conditional GET
      }

      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }

      while (true) {
        try {
          // Build request options. If we have a cached ETag, send If-None-Match
          const headers = { Accept: 'application/json' }
          if (cached && cached.etag) {
            headers['If-None-Match'] = cached.etag
          }

          const options = {
            method: 'GET',
            headers,
            // request timeout (got format uses timeout: { request: ms })
            timeout: { request: 10000 },
          }

          // Use the low-level request fetcher so we can observe status codes
          // like 304 (Not Modified) which _request / _requestJson would convert
          // into exceptions.
          const { res, buffer } = await this._requestFetcher(url, options, {})

          // Handle 304 Not Modified: reuse cached body
          if (res.statusCode === 304) {
            if (cached && cached.body) {
              // update storedAt so TTL calculations start from successful revalidation
              cached.storedAt = Date.now()
              this.constructor._memoryCache.set(key, cached)
              return cached.body
            }
            // unexpected 304 without cached body; fallthrough to re-fetch
          }

          // Map HTTP-level errors
          if (res.statusCode === 404) {
            throw new NotFound({
              prettyMessage: 'node not found',
              underlyingError: new Error('404'),
            })
          }
          if (res.statusCode === 401 || res.statusCode === 403) {
            throw new Inaccessible({
              prettyMessage: 'unauthorized',
              underlyingError: new Error(String(res.statusCode)),
            })
          }
          if (res.statusCode !== 200) {
            // For 5xx we'll throw to trigger retry logic below; for other codes throw InvalidResponse
            const underlying = new Error(`Got status code ${res.statusCode}`)
            if (res.statusCode >= 500) {
              throw new Inaccessible({ underlyingError: underlying })
            }
            throw new InvalidResponse({ underlyingError: underlying })
          }

          const json = this._parseJson(buffer)
          const body = this.constructor._validate(json, nodeSchema)

          // Parse response cache headers
          const cacheControl =
            res.headers?.['cache-control'] || res.headers?.['Cache-Control']
          const maxAge = this.constructor.parseMaxAge(cacheControl)
          const etag = res.headers?.etag || res.headers?.ETag
          const lastModified =
            res.headers?.['last-modified'] || res.headers?.['Last-Modified']

          // Per-request TTL: prefer explicit max-age
          // - If upstream provides max-age, use it.
          // - If upstream sets max-age=0 but provides no ETag, fall back to a
          //   conservative TTL to avoid hammering the API (see DEFAULT_FALLBACK_TTL).
          // - If upstream provides no cache-control, use the class default.
          let ttl
          if (maxAge != null) {
            if (maxAge === 0 && !etag) {
              // Allow operator to override via env var for production tuning
              const envTtl = Number(process.env.COMFYUI_FALLBACK_TTL)
              ttl =
                Number.isFinite(envTtl) && envTtl >= 0
                  ? envTtl
                  : this.constructor.DEFAULT_FALLBACK_TTL
            } else {
              ttl = maxAge
            }
          } else {
            ttl = this.constructor._cacheLength
          }

          // Store a cache entry even if ttl === 0 so conditional GETs can revalidate
          this.constructor._memoryCache.set(key, {
            body,
            etag,
            lastModified,
            storedAt: Date.now(),
            ttl,
          })

          return body
        } catch (err) {
          const status =
            err.response?.statusCode || err.statusCode || err.status || null

          // Map 404 explicitly
          if (status === 404) {
            throw new NotFound({ prettyMessage: 'node not found' })
          }

          // Unauthorized
          if (status === 401 || status === 403) {
            throw new Inaccessible({ prettyMessage: 'unauthorized' })
          }

          // Retry on network errors or 5xx
          const isNetwork =
            err instanceof Inaccessible ||
            err.code === 'ENOTFOUND' ||
            err.code === 'ECONNRESET' ||
            err.code === 'ETIMEDOUT'
          if ((status && status >= 500 && status < 600) || isNetwork) {
            if (attempt < maxRetries) {
              await sleep(delay)
              attempt++
              delay *= 2
              continue
            }
          }

          // Cannot recover
          throw new Inaccessible({ underlyingError: err })
        }
      }
    })()

    this.constructor._inflight.set(key, p)
    try {
      return await p
    } finally {
      this.constructor._inflight.delete(key)
    }
  }
}

export class ComfyuiDownloads extends BaseComfyuiService {
  static category = 'downloads'
  // Short URL: /comfyui/:node/downloads
  static route = { base: 'comfyui', pattern: ':node/downloads' }

  static openApi = {
    '/comfyui/{node}/downloads': {
      get: {
        summary: 'ComfyUI node downloads',
        parameters: pathParams({
          name: 'node',
          example: 'comfyui-image-captioner',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ node }) {
    const data = await this.fetchNode({ node })
    const downloads = data.downloads
    return renderDownloadsBadge({ downloads, labelOverride: 'downloads' })
  }
}

export class ComfyuiVersion extends BaseComfyuiService {
  static category = 'version'
  // Short URL: /comfyui/:node/version
  static route = { base: 'comfyui', pattern: ':node/version' }

  static openApi = {
    '/comfyui/{node}/version': {
      get: {
        summary: 'ComfyUI node version',
        parameters: pathParams({
          name: 'node',
          example: 'comfyui-image-captioner',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'version' }

  async handle({ node }) {
    const data = await this.fetchNode({ node })
    const version = data.latest_version && data.latest_version.version
    const rawLabel =
      (typeof data.name === 'string' && data.name.trim()) ||
      (typeof data.id === 'string' && data.id.trim()) ||
      (typeof node === 'string' ? node.trim() : node)
    const label =
      typeof rawLabel === 'string' && rawLabel
        ? rawLabel.toLowerCase()
        : 'version'
    // Prefer the node's human-friendly name when available, but ensure badge
    // labels stay lowercase for consistency.
    return renderVersionBadge({ version, defaultLabel: label })
  }
}

export class ComfyuiStars extends BaseComfyuiService {
  static category = 'social'
  // Short URL: /comfyui/:node/stars
  static route = { base: 'comfyui', pattern: ':node/stars' }

  static openApi = {
    '/comfyui/{node}/stars': {
      get: {
        summary: 'ComfyUI node GitHub stars',
        parameters: pathParams({
          name: 'node',
          example: 'comfyui-image-captioner',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'stars' }

  async handle({ node }) {
    const data = await this.fetchNode({ node })
    const stars = data.github_stars
    const message = stars == null ? 'unknown' : String(stars)
    return {
      label: 'stars',
      message,
      color: stars == null ? 'lightgrey' : 'blue',
    }
  }
}
