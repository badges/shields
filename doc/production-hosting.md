Production hosting
==================

Server secrets
--------------

Some services require the use of secret tokens or passwords. Those are stored
in `private/secret.json` which is not checked into the repository.

These settings are currently set on the production server:

- bintray_apikey
- bintray_user
- gh_client_id
- gh_client_secret
- gh_oauth_state
- libraries_io_api_key
- sentry_dsn
- shieldsIps
- shieldsSecret
- sl_insight_apiToken
- sl_insight_userUuid
- wheelmap_token

Gathered from
```
cat private/secret-production.json | jq keys | grep -o '".*"' | sed 's/"//g' | sed 's/^/- /`
```

The `secret.tpl.json` is a template file used by the Docker container to set the secrets based on
environment variables.

Main Server Sysadmin
--------------------

- Servers in DNS round-robin:
  - s0.shields-server.com: 192.99.59.72 (vps71670.vps.ovh.ca)
  - s1.shields-server.com: 51.254.114.150 (vps244529.ovh.net)
  - s2.shields-server.com: 149.56.96.133 (vps117870.vps.ovh.ca)
- Self-signed TLS certificates, but `img.shields.io` is behind CloudFlare, which provides signed certificates.
- Using systemd to automatically restart the server when it crashes.

See https://github.com/badges/ServerScript for helper admin scripts.
