SHELL:=/bin/bash

SERVER_TMP=${TMPDIR}shields-server-deploy
FRONTEND_TMP=${TMPDIR}shields-frontend-deploy

# This branch is reserved for the deploy process and should not be used for
# development. The deploy script will clobber it. To avoid accidentally
# pushing secrets to GitHub, this branch is configured to reject pushes.
WORKING_BRANCH=server-deploy-working-branch

all: website test

website:
	LONG_CACHE=false npm run build

deploy: deploy-s0 deploy-s1 deploy-s2 clean-server-deploy deploy-gh-pages deploy-gh-pages-clean

deploy-s0: prepare-server-deploy push-s0
deploy-s1: prepare-server-deploy push-s1
deploy-s2: prepare-server-deploy push-s2

prepare-server-deploy: website
	# Ship a copy of the front end to each server for debugging.
	# https://github.com/badges/shields/issues/1220
	rm -rf ${SERVER_TMP}
	git worktree prune
	git worktree add -B ${WORKING_BRANCH} ${SERVER_TMP}
	cp -r build ${SERVER_TMP}
	git -C ${SERVER_TMP} add -f build/
	git -C ${SERVER_TMP} commit --no-verify -m '[DEPLOY] Add frontend for debugging'
	mkdir -p ${SERVER_TMP}/private
	cp private/secret-production.json ${SERVER_TMP}/private/secret.json
	git -C ${SERVER_TMP} add -f private/secret.json
	git -C ${SERVER_TMP} commit --no-verify -m '[DEPLOY] MUST NOT BE ON GITHUB'

clean-server-deploy:
	rm -rf ${SERVER_TMP}
	git worktree prune

push-s0:
	git push -f s0 ${WORKING_BRANCH}:master

push-s1:
	git push -f s1 ${WORKING_BRANCH}:master

push-s2:
	git push -f s2 ${WORKING_BRANCH}:master

deploy-gh-pages:
	rm -rf ${FRONTEND_TMP}
	git worktree prune
	LONG_CACHE=true \
		BASE_URL=https://img.shields.io \
		NEXT_ASSET_PREFIX=https://shields.io \
		npm run build
	git worktree add -B gh-pages ${FRONTEND_TMP}
	git -C ${FRONTEND_TMP} ls-files | xargs git -C ${FRONTEND_TMP} rm
	git -C ${FRONTEND_TMP} commit --no-verify -m '[DEPLOY] Completely clean the index'
	cp -r build/* ${FRONTEND_TMP}
	cp favicon.png ${FRONTEND_TMP}
	echo shields.io > ${FRONTEND_TMP}/CNAME
	touch ${FRONTEND_TMP}/.nojekyll
	git -C ${FRONTEND_TMP} add .
	git -C ${FRONTEND_TMP} commit --no-verify -m '[DEPLOY] Add built site'
	git push -f origin gh-pages

deploy-gh-pages-clean:
	rm -rf ${FRONTEND_TMP}
	git worktree prune

deploy-heroku:
	git add -f private/secret.json build/
	git commit --no-verify -m'MUST NOT BE ON GITHUB'
	git push -f heroku HEAD:master
	git reset HEAD~1
	(git checkout -B gh-pages && \
	git merge master && \
	git push -f origin gh-pages:gh-pages) || git checkout master
	git checkout master

test:
	npm test

.PHONY: all website deploy prepare-server-deploy clean-server-deploy deploy-s0 deploy-s1 deploy-s2 push-s0 push-s1 push-s2 deploy-gh-pages deploy-gh-pages-clean deploy-heroku setup redis test
