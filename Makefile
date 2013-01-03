default: all

all: unit peanut

unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--recursive --reporter spec test/unit

peanut:
	@NODE_ENV=test peanut

.PHONY: unit peanut
