all:
	node make

favicon:
	node gh-badge.js '' '' '#bada55' .png > web/favicon.png

website:
	cat try.html | sed "s,<img src='/,<img src='//img.shields.io/," > index.html
	(git checkout -B gh-pages && \
	git merge master && \
	git push origin gh-pages:gh-pages) || git checkout master
	git checkout master

deploy: website
	git add Verdana.ttf
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f heroku HEAD:master
	git reset HEAD~1

.PHONY: all favicon website deploy
