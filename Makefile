all: website favicon test

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	SED=sed -r
	NEWLINE=$\n
endif
ifeq ($(UNAME_S),Darwin)
	SED=sed -E
	NEWLINE=$$'\n'
endif

favicon:
	node gh-badge.js '' '' '#bada55' .png > favicon.png

footer-production-transform:
	@$(SED) "s,(<img src=\")(/[^\"\?]+)\",\1https://img.shields.io\2?maxAge=2592000\"," \
		frontend/fragments/try-footer.html \
		| $(SED) "s,(<img src=\")(/[^\"\?]+\?[^\"]+)\",\1https://img.shields.io\2\&maxAge=2592000\"," \
		| $(SED) "s,<span id='imgUrlPrefix'>,&https://img.shields.io," \
		| $(SED) "s,var origin = '';,var origin = 'https://img.shields.io';," \
		> build/try-footer.html

website:
	npm run build:production

deploy: deploy-s0 deploy-s1 deploy-s2 deploy-gh-pages

deploy-s0:
	git add -f Verdana.ttf
	git add -f private/secret.json
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f s0 HEAD:master
	git reset HEAD~1
	git checkout master

deploy-s1:
	git add -f Verdana.ttf
	git add -f private/secret.json
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f s1 HEAD:master
	git reset HEAD~1
	git checkout master

deploy-s2:
	git add -f Verdana.ttf
	git add -f private/secret.json
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f s2 HEAD:master
	git reset HEAD~1
	git checkout master

deploy-gh-pages: website
	(git checkout -B gh-pages master && \
	git add -f index.html && \
	git commit -m '[DEPLOY] Build index.html' && \
	git push -f origin gh-pages:gh-pages) || git checkout master
	git checkout master

deploy-heroku:
	git add -f Verdana.ttf
	git add -f private/secret.json
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
