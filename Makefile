WORDNOKCACHEDIR = '..'

test:
	node tests/levelnamer-tests.js
	node tests/differentiate-level-names-tests.js

start-wordnok-cache:
	$(PM2) start $(WORDNOKCACHEDIR)/start-cache-server.js --name wordnok-cache || \
	echo "wordnok-cache has already been started."
