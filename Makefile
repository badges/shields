SHELL:=/bin/bash

SERVER_TMP=${TMPDIR}shields-server-deploy
FRONTEND_TMP=${TMPDIR}shields-frontend-deploy

# This branch is reserved for the deploy process and should not be used for
# development. The deploy script will clobber it. To avoid accidentally
# pushing secrets to GitHub, this branch is configured to reject pushes.
WORKING_BRANCH=server-deploy-working-branch

all: test

deploy: deploy-s0 deploy-s1 deploy-s2 clean-server-deploy deploy-gh-pages deploy-gh-pages-clean

deploy-s0: prepare-server-deploy push-s0
deploy-s1: prepare-server-deploy push-s1
deploy-s2: prepare-server-deploy push-s2

prepare-server-deploy:
	# Ship a copy of the front end to each server for debugging.
	# https://github.com/badges/shields/issues/1220
	INCLUDE_DEV_PAGES=false \
		npm run build
	rm -rf ${SERVER_TMP}
	git worktree prune
	git worktree add -B ${WORKING_BRANCH} ${SERVER_TMP}
	cp -r public ${SERVER_TMP}
	git -C ${SERVER_TMP} add -f public/
	git -C ${SERVER_TMP} commit --no-verify -m '[DEPLOY] Add frontend for debugging'
	cp config/local-shields-io-production.yml ${SERVER_TMP}/config/
	git -C ${SERVER_TMP} add -f config/local-shields-io-production.yml
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
	GATSBY_BASE_URL=https://img.shields.io \
		INCLUDE_DEV_PAGES=false \
		npm run build
	git worktree add -B gh-pages ${FRONTEND_TMP}
	git -C ${FRONTEND_TMP} ls-files | xargs git -C ${FRONTEND_TMP} rm
	git -C ${FRONTEND_TMP} commit --no-verify -m '[DEPLOY] Completely clean the index'
	cp -r public/* ${FRONTEND_TMP}
	echo shields.io > ${FRONTEND_TMP}/CNAME
	touch ${FRONTEND_TMP}/.nojekyll
	git -C ${FRONTEND_TMP} add .
	git -C ${FRONTEND_TMP} commit --no-verify -m '[DEPLOY] Add built site'
	git push -f origin gh-pages

deploy-gh-pages-clean:
	rm -rf ${FRONTEND_TMP}
	git worktree prune

test:
	npm test

.PHONY: all deploy prepare-server-deploy clean-server-deploy deploy-s0 deploy-s1 deploy-s2 push-s0 push-s1 push-s2 deploy-gh-pages deploy-gh-pages-clean deploy-heroku setup redis test
