var test = require('tape');
var levelnamer = require('../index');

function runNamingTest(testTitle, nameOpts, expectedResults) {
  test(testTitle, function testIt(t) {
    t.plan(nameOpts.totalLevels + 1);

    levelnamer.getNamedLevels(nameOpts, checkResults);

    function checkResults(error, levelNames) {
      if (error) {
        console.log(error);
      }
      t.ok(!error, 'Completes without an error.');
      levelNames.forEach(checkLevel);
    }

    function checkLevel(levelName, i) {
      t.equal(
        levelName, expectedResults[i], 'The '+ (i+1) + 'th level is correct.'
      );
    }
  });
}

runNamingTest(
  'Get a name level for a word.',
  {
    word: 'yob',
    totalLevels: 12
  },
  [
    'Plug-ugly',
    'Muscleman',
    'Skinhead',
    'Bullyboy',
    'Hooligan',
    'Muscle',
    'Tearaway',
    'Tough Guy',
    'Chav',
    'Yob',
    'Prime Yob',
    'Master Yob'
  ]
);
