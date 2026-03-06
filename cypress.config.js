import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  expose: {
    backend_url: 'http://localhost:8080',
  },
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
  video: true,
  videoCompression: true,
  allowCypressEnv: false,
})
