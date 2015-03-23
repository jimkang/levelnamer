var test = require('tape');
var levelnamer = require('../index');

test('Get a name level for a word.', function basicTest(t) {
  t.plan(13);

  var expectedResult = {
    className: 'Yob',
    hitDie: 'd2',
    lateLevelHpGain: 1,
    levels: [
      {
        level: 1,
        name: 'Chav',
        hitDice: '1',
        xp: 0
      },
      {
        level: 2,
        name: 'Tearaway',
        hitDice: '2',
        xp: 1250
      },
      {
        level: 3,
        name: 'Hooligan',
        hitDice: '3',
        xp: 2500
      },
      {
        level: 4,
        name: 'Bullyboy',
        hitDice: '4',
        xp: 5000
      },
      {
        level: 5,
        name: 'Muscle',
        hitDice: '5',
        xp: 10000
      },
      {
        level: 6,
        name: 'Tough Guy',
        hitDice: '6',
        xp: 20000
      },
      {
        level: 7,
        name: 'Skinhead',
        hitDice: '7',
        xp: 42500
      },
      {
        level: 8,
        name: 'Plug-ugly',
        hitDice: '1',
        xp: 70000
      },
      {
        level: 9,
        name: 'Yob',
        hitDice: '9',
        xp: 110000
      },
      {
        level: 10,
        name: 'Master Yob',
        hitDice: '10',
        xp: 160000
      },
      {
        level: 11,
        name: 'Lord Yob',
        hitDice: '10+2',
        xp: 220000
      },
      {
        level: 12,
        name: 'Guildmaster Yob',
        hitDice: '10+4',
        xp: 440000
      }
    ]
  };

  var opts = {
    word: 'yob',
    // wordnok: 
    // random: 
  };

  levelnamer.getNamedLevels(opts, checkResults);

  function checkResults(error, result) {
    console.log(error);
    t.ok(!error, 'Completes without an error.');
    t.equal(result.className, expectedResult.className, 'Returns a className.');
    t.equal(result.hitDie, expectedResult.hitDie, 'Returns a hit die type.');
    t.equal(
      result.lateLevelHpGain,
      expectedResult.lateLevelHpGain,
      'Returns a lateLevelHpGain.'
    );
    result.levels.forEach(function checkLevel(level, i) {
      // t.deepEqual(
      //   level, expectedResult.levels[i], 'The '+ (i+1) + 'th level is correct.'
      // );
    });
  }
});
