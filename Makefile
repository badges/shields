all: website deploy

favicon:
	node gh-badge.js '' '' '#bada55' .png > web/favicon.png

website:
	cat try.html | sed "s,<img src='/,&/img.shields.io/," \
             | sed "s,<span id='imgUrlPrefix'>,&http://img.shields.io," > index.html

deploy:
	git add -f Verdana.ttf
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f heroku HEAD:master
	git reset HEAD~1
	(git checkout -B gh-pages && \
	git merge master && \
	git push origin gh-pages:gh-pages) || git checkout master
	git checkout master

.PHONY: all favicon website deploy
