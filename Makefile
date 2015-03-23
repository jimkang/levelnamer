WORDNOKCACHEDIR = '..'

test:
	node tests/levelnamer-tests.js

start-wordnok-cache:
	$(PM2) start $(WORDNOKCACHEDIR)/start-cache-server.js --name wordnok-cache || \
	echo "wordnok-cache has already been started."
