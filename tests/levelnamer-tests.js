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

runNamingTest(
  'Make sure only nouns are used.',
  {
    word: 'engineer',
    totalLevels: 20,
    memoizeServerPort: 4444
  },
  [
    'Hydraulician',
    'Hydraulician (2nd level)',
    'Machinist',
    'Machinist (4th level)',
    'Pioneer',
    'Pioneer (6th level)',
    'Driver',
    'Driver (8th level)',
    'Mechanician',
    'Mechanician (10th level)',
    'Mechanician (11th level)',
    'Mechanician (12th level)',
    'Engineer',
    'Engineer (14th level)',
    'Engineer (15th level)',
    'Engineer Captain',
    'Engineer Lord',
    'Engineer Director-General',
    'Engineer Potentate',
    'Engineer Potentate (20th level)'
  ]
);

runNamingTest(
  'Make sure the singular form of the base title is used.',
  {
    word: 'mosses',
    totalLevels: 15,
  },
  [
    "Acrocarp",
    "Pleurocarp",
    "Bog Moss",
    "Acrocarpous Moss",
    "Bog",
    "Morass",
    "Sphagnum",
    "Sphagnum Moss",
    "Moss",
    "Moss (10th level)",
    "Superior Moss",
    "Arch Moss",
    "Supreme Moss",
    "Supreme Moss (14th level)",
    "Supreme Moss (15th level)"
  ]
);
