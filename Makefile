all:
	node make

favicon:
	node gh-badge.js '' '' '#bada55' .png > web/favicon.png

deploy:
	git add Verdana.ttf
	git commit -m'MUST NOT BE ON GITHUB'
	git push -f heroku HEAD:master
	git reset HEAD~1

.PHONY: all deploy
