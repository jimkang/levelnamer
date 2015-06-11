test:
	node tests/levelnamer-tests.js
	node tests/differentiate-level-names-tests.js

pushall:
	git push origin master && npm publish
