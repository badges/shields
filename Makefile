SHELL:=/bin/bash

SERVER_TMP=${TMPDIR}shields-server-deploy
FRONTEND_TMP=${TMPDIR}shields-frontend-deploy

all: website favicon test

favicon:
	# This isn't working right now. See https://github.com/badges/shields/issues/1788
	node lib/badge-cli.js '' '' '#bada55' .png > favicon.png

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
	git worktree add -B production ${SERVER_TMP}
	cp -r build ${SERVER_TMP}
	git -C ${SERVER_TMP} add build/
	git -C ${SERVER_TMP} commit -m '[DEPLOY] Add frontend for debugging'
	cp private/secret-production.json ${SERVER_TMP}/private/secret.json
	cp Verdana.ttf ${SERVER_TMP}
	git -C ${SERVER_TMP} add private/secret.json Verdana.ttf
	git -C ${SERVER_TMP} commit -m '[DEPLOY] MUST NOT BE ON GITHUB'

clean-server-deploy:
	rm -rf ${SERVER_TMP}
	git worktree prune

push-s0:
	git push -f s0 production:master

push-s1:
	git push -f s1 production:master

push-s2:
	git push -f s2 production:master

deploy-gh-pages:
	rm -rf ${FRONTEND_TMP}
	git worktree prune
	LONG_CACHE=true \
		BASE_URL=https://img.shields.io \
		NEXT_ASSET_PREFIX=https://shields.io \
		npm run build
	git worktree add -B gh-pages ${FRONTEND_TMP}
	git -C ${FRONTEND_TMP} ls-files | xargs git -C ${FRONTEND_TMP} rm
	git -C ${FRONTEND_TMP} commit -m '[DEPLOY] Completely clean the index'
	cp -r build/* ${FRONTEND_TMP}
	cp favicon.png ${FRONTEND_TMP}
	echo shields.io > ${FRONTEND_TMP}/CNAME
	touch ${FRONTEND_TMP}/.nojekyll
	git -C ${FRONTEND_TMP} add .
	git -C ${FRONTEND_TMP} commit -m '[DEPLOY] Add built site'
	git push -f origin gh-pages

deploy-gh-pages-clean:
	rm -rf ${FRONTEND_TMP}
	git worktree prune

deploy-heroku:
	git add -f Verdana.ttf private/secret.json build/
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f heroku HEAD:master
	git reset HEAD~1
	(git checkout -B gh-pages && \
	git merge master && \
	git push -f origin gh-pages:gh-pages) || git checkout master
	git checkout master

setup:
	curl http://download.redis.io/releases/redis-2.8.8.tar.gz >redis.tar.gz \
	&& tar xf redis.tar.gz \
	&& rm redis.tar.gz \
	&& mv redis-2.8.8 redis \
	&& cd redis \
	&& make

redis:
	./redis/src/redis-server

test:
	npm test

.PHONY: all favicon website deploy deploy-s0 deploy-s1 deploy-s2 deploy-gh-pages deploy-heroku setup redis test
