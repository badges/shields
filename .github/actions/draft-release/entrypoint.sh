#!/bin/bash

set -euxo pipefail

# mark workspace dir as 'safe'
git config --system --add safe.directory '/github/workspace'

# Find last server-YYYY-MM-DD tag
git fetch --unshallow --tags
LAST_TAG=$(git tag | grep server | tail -n 1)

# Set up a git user
git config user.name "release[bot]"
git config user.email "actions@users.noreply.github.com"

# Find the marker in CHANGELOG.md
INSERT_POINT=$(grep -n "^\-\-\-$" CHANGELOG.md | cut -f1 -d:)
INSERT_POINT=$((INSERT_POINT+1))

# Generate a release name
RELEASE_NAME="server-$(date --rfc-3339=date)"

# Assemble changelog entry
rm -f temp-changes.txt
touch temp-changes.txt
{
    echo "## $RELEASE_NAME"
    echo ""
    git log "$LAST_TAG"..HEAD --no-merges --oneline --pretty="format:- %s" --perl-regexp --author='^((?!dependabot).*)$'
    echo $'\n- Dependency updates\n'
} >> temp-changes.txt
BASE_URL="https:\/\/github.com\/badges\/shields\/issues\/"
sed -r -i "s/\((\#)([0-9]+)\)$/\[\1\2\]\($BASE_URL\2\)/g" temp-changes.txt

# Write the changelog
sed -i "${INSERT_POINT} r temp-changes.txt" CHANGELOG.md

# Cleanup
rm temp-changes.txt

# Run prettier (to ensure the markdown file doesn't fail CI)
npx prettier@$(cat package.json | jq -r .devDependencies.prettier) --write "CHANGELOG.md"

# Generate a unique branch name
BRANCH_NAME="$RELEASE_NAME"-$(uuidgen | head -c 8)
git checkout -b "$BRANCH_NAME"

# Commit + push changelog
git add CHANGELOG.md
git commit -m "Update Changelog"
git push origin "$BRANCH_NAME"

# Submit a PR
TITLE="Changelog for Release $RELEASE_NAME"
PR_RESP=$(curl https://api.github.com/repos/"$REPO_NAME"/pulls \
    -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    --data '{"title": "'"$TITLE"'", "body": "'"$TITLE"'", "head": "'"$BRANCH_NAME"'", "base": "master"}')

# Add the 'release' label to the PR
PR_API_URL=$(echo "$PR_RESP" | jq -r ._links.issue.href)
curl "$PR_API_URL" \
    -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    --data '{"labels":["release"]}'
