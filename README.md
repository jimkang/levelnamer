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
        word: 'Yob'
      }, 
      showResults
    );

    function showResults(error, results) {
      console.log(results);
    }

Tests
-----

Run tests with `make test`.

License
-------

MIT.
