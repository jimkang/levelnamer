var levelnamer = require('../index');
var _ = require('lodash');

if (process.argv.length < 3) {
  console.log('Usage: node run-levelnamer.js <base title>');
  process.exit();
}

var baseTitle = process.argv[2];

levelnamer.getNamedLevels(
  {
    word: process.argv[2]
  },
  function displayResults(error, results) {
    if (error) {
      console.log(error);
    }
    console.log(JSON.stringify(results, null, '  '));
  }
);
