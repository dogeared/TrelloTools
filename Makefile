default: all

all: peanut

peanut:
	@NODE_ENV=test peanut

.PHONY: peanut
