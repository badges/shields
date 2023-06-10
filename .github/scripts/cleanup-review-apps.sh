#!/bin/bash

set -euxo pipefail

apps=$(flyctl apps list --json | jq -r .[].ID | grep -E "pr-[0-9]+-badges-shields") || exit 0

for app in $apps
do
  flyctl apps destroy "$app" -y
done
