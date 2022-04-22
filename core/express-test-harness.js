import express from 'express'
import portfinder from 'portfinder'
import got from './got-test-client.js'

export class ExpressTestHarness {
  constructor() {
    this.app = express()
  }

  async start() {
    const port = (this.port = await portfinder.getPortPromise())
    this.baseUrl = `http://127.0.0.1:${port}`
    await new Promise(resolve => {
      this.server = this.app.listen({ host: '::', port }, () => resolve())
    })
  }

  async stop() {
    await new Promise(resolve => this.server.close(resolve))
  }

  ensureStarted() {
    if (!this.server) {
      throw Error('Server has not been started')
    }
  }

  async get(url, options) {
    this.ensureStarted()
    return got.get(`${this.baseUrl}${url}`, options)
  }

  async post(url, options) {
    this.ensureStarted()
    return got.post(`${this.baseUrl}${url}`, options)
  }
}
