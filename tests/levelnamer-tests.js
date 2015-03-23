var test = require('tape');
var levelnamer = require('../index');

test('Get a name level for a word.', function basicTest(t) {
  t.plan(13);

  var expectedResults = [
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
  ];

  var opts = {
    word: 'yob',
    totalLevels: 12
    // wordnok: 
    // random: 
  };

  levelnamer.getNamedLevels(opts, checkResults);

  function checkResults(error, levelNames) {
    if (error) {
      console.log(error);
    }
    t.ok(!error, 'Completes without an error.');
    levelNames.forEach(function checkLevel(levelName, i) {
      t.equal(
        levelName, expectedResults[i], 'The '+ (i+1) + 'th level is correct.'
      );
    });
  }
});
