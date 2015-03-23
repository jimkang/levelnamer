var levelnamer = require('../index');
var _ = require('lodash');
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;

if (process.argv.length < 3) {
  console.log('Usage: node run-levelnamer.js <base title>');
  process.exit();
}

var baseTitle = process.argv[2];

var probable = createProbable({
  random: seedrandom(baseTitle)
});

levelnamer.getNamedLevels(
  {
    word: process.argv[2],
    totalLevels: 12 + probable.rollDie(12)
  },
  function displayResults(error, results) {
    if (error) {
      console.log(error);
    }
    console.log(JSON.stringify(results, null, '  '));
  }
);
