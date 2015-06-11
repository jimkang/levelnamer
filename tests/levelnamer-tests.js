var test = require('tape');
var levelnamer = require('../index');
var config = require('../config');

function runNamingTest(testTitle, nameOpts) {
  test(testTitle, function testIt(t) {
    t.plan(nameOpts.totalLevels + 1);

    nameOpts.config = config;
    levelnamer.getNamedLevels(nameOpts, checkResults);

    function checkResults(error, levelNames) {
      if (error) {
        console.log(error);
      }
      t.ok(!error, 'Completes without an error.');
      console.log('levelNames:\n' + JSON.stringify(levelNames, null, '  '));
      levelNames.forEach(checkLevel);
    }

    var levelNamesChecked = {};

    function checkLevel(levelName, i) {
      t.ok(
        !(levelName in levelNamesChecked),
        'The '+ (i+1) + 'th level is unique.'
      );
      levelNamesChecked[levelName] = true;
    }
  });
}

runNamingTest(
  'Get a name level for a word.',
  {
    word: 'yob',
    totalLevels: 12
  }
);

runNamingTest(
  'Make sure only nouns are used.',
  {
    word: 'engineer',
    totalLevels: 20
  }
);

runNamingTest(
  'Make sure the singular form of the base title is used.',
  {
    word: 'mosses',
    totalLevels: 15,
  }
);
