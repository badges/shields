# Production hosting

In production, a deploy commit checks in two config files:

- `.env`
- `config/local-shields-io-production.yml`

The `.env` file sets `NODE_CONFIG_ENV` which bootstraps the configuration process. The rest of the configuration is loaded from three sources:

- `config/local-shields-io-production.yml` (secrets)
- [`config/shields-io-production.yml`](../config/shields-io-production.yml) (non-secrets)
- [`config/default.yml`](../config/default.yml)

These settings are currently set in `config/local-shields-io-production.yml`:

- bintray_apikey
- bintray_user
- gh_client_id
- gh_client_secret
- gh_oauth_state
- libraries_io_api_key
- sentry_dsn
- shields_secret
- sl_insight_apiToken
- sl_insight_userUuid
- wheelmap_token

## Main Server Sysadmin

- Servers in DNS round-robin:
  - s0.shields-server.com: 192.99.59.72 (vps71670.vps.ovh.ca)
  - s1.shields-server.com: 51.254.114.150 (vps244529.ovh.net)
  - s2.shields-server.com: 149.56.96.133 (vps117870.vps.ovh.ca)
- Self-signed TLS certificates, but `img.shields.io` is behind CloudFlare, which provides signed certificates.
- Using systemd to automatically restart the server when it crashes.

See https://github.com/badges/ServerScript for helper admin scripts.
