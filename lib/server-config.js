'use strict';

// This file should only be required by server.js. To simplify testing, config
// should be injected into other components needing it.

const url = require('url');
const envFlag = require('node-env-flag');

const secureServer = !!process.env.HTTPS;
const serverPort = +process.env.PORT || +process.argv[2] || (secureServer ? 443 : 80);
const bindAddress = process.env.BIND_ADDRESS || process.argv[3] || '::';

const config = {
  secureServer,
  secureServerKey: process.env.HTTPS_KEY,
  secureServerCert: process.env.HTTPS_CRT,
  serverPort,
  bindAddress,
  infoSite: process.env.INFOSITE || 'https://shields.io',
  githubApiUrl: process.env.GITHUB_URL || 'https://api.github.com',
  frontendUri: url.format({
    protocol: secureServer ? 'https' : 'http',
    hostname: bindAddress,
    port: serverPort,
    pathname: '/',
  }),
  debug: {
    github: {
      enabled: envFlag(process.env.GITHUB_DEBUG_ENABLED, true),
      intervalSeconds: process.env.GITHUB_DEBUG_INTERVAL_SECONDS || 5,
    }
  },
};

module.exports = config;
