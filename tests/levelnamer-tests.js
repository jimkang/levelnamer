var test = require('tape');
var levelnamer = require('../index');
var config = require('../config');

function runNamingTest(testTitle, nameOpts, expectedResults) {
  test(testTitle, function testIt(t) {
    t.plan(nameOpts.totalLevels + 1);

    nameOpts.config = config;
    levelnamer.getNamedLevels(nameOpts, checkResults);

    function checkResults(error, levelNames) {
      if (error) {
        console.log(error);
      }
      t.ok(!error, 'Completes without an error.');
      // console.log(levelNames);
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
    'Hooligan',
    'Muscleman',
    'Tough Guy',
    'Bullyboy',
    'Tearaway',
    'Plug-Ugly',
    'Chav',
    'Muscle',
    'Skinhead',
    'Skinhead (10th level)',
    'Yob',
    'Yob of the Body'
  ]
);

runNamingTest(
  'Make sure only nouns are used.',
  {
    word: 'engineer',
    totalLevels: 20,
    memoizeServerPort: 4444
  },
  [
    'Pioneer',
    'Pioneer (2nd level)',
    'Driver',
    'Driver (4th level)',
    'Hydraulician',
    'Hydraulician (6th level)',
    'Mechanician',
    'Mechanician (8th level)',
    'Machinist',
    'Machinist (10th level)',
    'Machinist (11th level)',
    'Machinist (12th level)',
    'Engineer',
    'Engineer of the Dawn',
    'Engineer of the Dusk',
    'Engineer of the Twilight',
    'Engineer of the Twilight (17th level)',
    'Engineer of the Twilight (18th level)',
    'Expert Engineer of the Twilight',
    'Prime Engineer of the Twilight'
  ]
);

runNamingTest(
  'Make sure the singular form of the base title is used.',
  {
    word: 'mosses',
    totalLevels: 15,
  },
  [
    'Pleurocarpous Moss',
    'Peat Moss',
    'Morass',
    'Acrocarp',
    'Pleurocarp',
    'Acrocarpous Moss',
    'Bog',
    'Sphagnum',
    'Sphagnum Moss',
    'Bog Moss',
    'Bog Moss (11th level)',
    'Moss',
    'Moss (13th level)',
    'Expert Moss',
    'Prime Moss'
  ]
);
