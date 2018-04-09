install:
	npm install

build:
	rm -rf dist
	npm run build

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
