var test = require('tape');
var differentiateLevelNames = require('../differentiate-level-names');

test('Differentiate', function differentiate(t) {
  t.plan(1);

  var results = differentiateLevelNames(
    [
      'Day Tripper',
      'Day Tripper',
      'Day Tripper',
      'Day Tripper',
      'Day Tripper',
      'Vacationer',
      'Tourist',
      'Tourist',
      'Tourist'
    ]
  );

  var expectedResults = [
    'Day Tripper',
    'Day Tripper (2nd level)',
    'Day Tripper (3rd level)',
    'Day Tripper (4th level)',
    'Day Tripper (5th level)',
    'Vacationer',
    'Tourist',
    'Tourist (8th level)',
    'Tourist (9th level)'
  ];

  t.deepEqual(results, expectedResults);
});


