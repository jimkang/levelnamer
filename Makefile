LEVELCACHEDIR = '../level-cache-server'
PM2 = '$(LEVELCACHEDIR)/node_modules/.bin/pm2'

test: start-level-cache
	node tests/levelnamer-tests.js
	node tests/differentiate-level-names-tests.js

start-level-cache:
	$(PM2) start $(LEVELCACHEDIR)/start-cache-server.js --name level-cache || \
	echo "level-cache has already been started."
