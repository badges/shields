#!/bin/bash

set -euo pipefail

# Docusaurus outputs some important errors as log messages
# but doesn't actually fail
# https://github.com/facebook/docusaurus/blob/v2.4.3/packages/docusaurus/src/server/siteMetadata.ts#L75-L92
# this script runs `docusaurus build`. If it outputs any [ERROR]s, we exit with 1

if ( npm run build 2>&1 | grep '\[ERROR\]' )
then
    exit 1
else
    exit 0
fi
