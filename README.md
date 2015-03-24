levelnamer
==================

Generates 1E AD&D-style named levels given arbitrary 'classes'.

Installation
------------

    npm install levelnamer

Usage
-----

    var levelnamer = require('levelnamer');
    levelnamer.getNamedLevels(
      {
        word: 'Yob',
        totalLevels: 20,
        config: {
          wordnikAPIKey: 'your-key-goes-here'
        }
      }, 
      showResults
    );

    function showResults(error, results) {
      console.log(results);
    }

You can optionally set `memoizeServerPort` in the opts if you are using [multilevel-cache-tools](https://github.com/jimkang/multilevel-cache-tools) with [wordnok](https://github.com/jimkang/wordnok) to memoize those calls.

Tests
-----

Run tests with `make test`.

License
-------

MIT.
