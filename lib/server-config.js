'use strict';

// This file should only be required by server.js. To simplify testing, config
// should be injected into other components needing it.

const url = require('url');
const envFlag = require('node-env-flag');

function envArray(envVar, defaultValue, delimiter) {
  delimiter = delimiter || ',';
  if (envVar) {
    return envVar.split(delimiter);
  } else {
    return defaultValue;
  }
}

const isSecure = envFlag(process.env.HTTPS, false);
const port = +process.env.PORT || +process.argv[2] || (isSecure ? 443 : 80);
const address = process.env.BIND_ADDRESS || process.argv[3] || '::';
const baseUri = url.format({
  protocol: isSecure ? 'https' : 'http',
  hostname: address,
  port,
  pathname: '/',
});

// The base URI provides a suitable value for development. Production should
// configure this.
const allowedOrigin = envArray(process.env.ALLOWED_ORIGIN, baseUri.replace(/\/$/, ''), ',');

const config = {
  bind: {
    port,
    address,
  },
  ssl: {
    isSecure,
    key: process.env.HTTPS_KEY,
    cert: process.env.HTTPS_CRT,
  },
  baseUri,
  redirectUri: process.env.REDIRECT_URI || process.env.INFOSITE,
  cors: {
    allowedOrigin,
  },
  persistence: {
    dir: process.env.PERSISTENCE_DIR || './private',
  },
  services: {
    github: {
      baseUri: process.env.GITHUB_URL || 'https://api.github.com',
      debug: {
        enabled: envFlag(process.env.GITHUB_DEBUG_ENABLED, false),
        intervalSeconds: process.env.GITHUB_DEBUG_INTERVAL_SECONDS || 300,
      },
    },
  },
};

module.exports = config;
