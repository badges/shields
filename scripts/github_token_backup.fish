#!/usr/bin/env fish
#
# Back up the GitHub tokens from each production server.
#

if test (count $argv) -lt 1
  echo Usage: (basename (status -f)) shields_secret
end

set shields_secret $argv[1]

function do_backup
  set server $argv[1]
  curl --insecure -u ":$shields_secret" "https://$server.servers.shields.io/\$github-auth/tokens" > "$server""_tokens.json"
end

for server in s0 s1 s2
  do_backup $server
end
