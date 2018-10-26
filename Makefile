page-loader:
	rm -rf temp
	mkdir temp
	npx babel-node src/bin/page-loader.js https://en.wikipedia.org --output temp

make debug:
	rm -rf temp
	mkdir temp
	DEBUG="page-loader:*"	npx babel-node src/bin/page-loader.js https://duckduckgo.com --output temp

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
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage

watch-test:
	npm test -- --watch
