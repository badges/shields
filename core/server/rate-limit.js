'use strict'

// A rate limit ensures that a request parameter gets flagged if it goes
// above a limit.
module.exports = class RateLimit {
  constructor(options = {}) {
    // this.hits: Map from request parameters to the number of hits.
    this.hits = new Map()
    this.period = options.period || 200 // 3 min ⅓, in seconds
    this.maxHitsPerPeriod = options.maxHitsPerPeriod || 500
    this.banned = new Set()
    this.bannedUrls = new Set()
    this.whitelist = options.whitelist || /(?!)/ // Matches nothing by default.
    this.interval = setInterval(this.resetHits.bind(this), this.period * 1000)
  }

  stop() {
    clearInterval(this.interval)
    this.interval = undefined
  }

  resetHits() {
    this.hits.clear()
    this.banned.clear()
    this.bannedUrls.clear()
  }

  isBanned(reqParam, req, res) {
    const hitsInCurrentPeriod = this.hits.get(reqParam) || 0
    if (
      reqParam != null &&
      !this.whitelist.test(reqParam) &&
      hitsInCurrentPeriod > this.maxHitsPerPeriod
    ) {
      this.banned.add(reqParam)
    }

    if (this.banned.has(reqParam)) {
      res.statusCode = 429
      res.setHeader('Retry-After', String(this.period))
      res.end(
        `Exceeded limit ${this.maxHitsPerPeriod} requests ` +
          `per ${this.period} seconds`
      )
      this.bannedUrls.add(req.url)
      return true
    }

    this.hits.set(reqParam, hitsInCurrentPeriod + 1)
    return false
  }

  toJSON() {
    return {
      banned: [...this.banned],
      hits: [...this.hits],
      urls: [...this.bannedUrls],
    }
  }
}
