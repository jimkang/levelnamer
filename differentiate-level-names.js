var ordinal = require('ordinal').english;

function differentiateLevelNames(names) {
  var differentiated = [];
  var previousName;

  for (var i = 0; i < names.length; ++i) {
    var current = names[i];
    var newName = current;
    if (current === previousName) {
       newName = current + ' (' + ordinal(i + 1) + ' level)';
    }
    differentiated.push(newName);
    previousName = current;
  }

  return differentiated;
}

module.exports = differentiateLevelNames;