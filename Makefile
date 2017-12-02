all: website favicon test

favicon:
	node lib/badge-cli.js '' '' '#bada55' .png > favicon.png

website:
	LONG_CACHE=false BASE_URL=https://img.shields.io npm run build

deploy: deploy-s0 deploy-s1 deploy-s2 deploy-gh-pages

deploy-s0:
	# Ship a copy of the front end to each server for debugging.
	# https://github.com/badges/shields/issues/1220
	LONG_CACHE=false BASE_URL=https://s0.shields-server.com npm run build
	git add -f Verdana.ttf private/secret.json index.html
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f s0 HEAD:master
	git reset HEAD~1
	git checkout master

deploy-s1:
	LONG_CACHE=false BASE_URL=https://s1.shields-server.com npm run build
	git add -f Verdana.ttf private/secret.json index.html
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f s1 HEAD:master
	git reset HEAD~1
	git checkout master

deploy-s2:
	LONG_CACHE=false BASE_URL=https://s2.shields-server.com npm run build
	git add -f Verdana.ttf private/secret.json index.html
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f s2 HEAD:master
	git reset HEAD~1
	git checkout master

deploy-gh-pages:
	(LONG_CACHE=true BASE_URL=https://img.shields.io npm run build && \
	git checkout -B gh-pages master && \
	git add -f index.html && \
	git commit -m '[DEPLOY] Build index.html' && \
	git push -f origin gh-pages:gh-pages) || git checkout master
	git checkout master

deploy-heroku:
	git add -f Verdana.ttf private/secret.json index.html
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
