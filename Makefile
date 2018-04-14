install:
	npm install

build:
	rm -rf dist
	npm run build

link:
	make build
	sudo npm link

publish:
	npm publish

lint:
	npm run eslint .

test:
	npm run test

test-coverage:
	npm run test-coverage

watch-test:
	npm run watch-test

page-loader:
	rm -rf temp
	mkdir temp
	npm run babel-node src/bin/page-loader.js https://en.wikipedia.org -- --output temp1

make debug:
	rm -rf temp
	mkdir temp
	DEBUG="page-loader:*"	npm run babel-node src/bin/page-loader.js https://en.wikipedia.org -- --output temp
