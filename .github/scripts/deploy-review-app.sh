#!/bin/bash

set -euxo pipefail

app="pr-$PR_NUMBER-badges-shields"
region="ewr"
org="shields-io"

# Get PR JSON from the API
# This will fail if $PR_NUMBER is not a valid PR
pr_json=$(curl --fail "https://api.github.com/repos/badges/shields/pulls/$PR_NUMBER")

# Checkout the PR branch
git config user.name "actions[bot]"
git config user.email "actions@users.noreply.github.com"
git fetch origin "pull/$PR_NUMBER/head:pr-$PR_NUMBER"
git checkout "pr-$PR_NUMBER"

# If the app does not already exist, create it
if ! flyctl status --app "$app"; then
  flyctl launch --no-deploy --copy-config --name "$app" --region "$region" --org "$org" --dockerfile ./Dockerfile
  echo $SECRETS | tr " " "\n" | flyctl secrets import --app "$app"
fi

# Deploy
flyctl deploy --app "$app" --regions "$region"
flyctl scale count 1 --app "$app" --yes

# Post a comment on the PR
app_url=$(flyctl status --app "$app" --json | jq -r .Hostname)
comment_url=$(echo "$pr_json" | jq .comments_url -r)
curl "$comment_url" \
    -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    --data "{\"body\":\"🚀 Updated review app: https://$app_url\"}"
