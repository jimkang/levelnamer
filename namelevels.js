var createWordnok = require('wordnok').createWordnok;
var config = require('./config');
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var _ = require('lodash');
var createIsCool = require('iscool');

var isCool = createIsCool();

function getNamedLevels(opts, done) {
  var word;
  var wordnok;

  if (opts) {
    word = opts.word;
    wordnok = opts.wordnok;
  }

  if (!word) {
    throw new Error('word not give to getNamedLevels.');
  }
  if (!wordnok) {
    wordnok = createWordnok({
      apiKey: config.wordnikAPIKey,
      // memoizeServerPort: 4040
    });
  }

  wordnok.getRelatedWords(
    {
      word: word
    },
    useRelatedWords
  );

  function useRelatedWords(error, relatedWords) {
    if (error) {
      done(error);
    }
    else {
      buildLevels(word, relatedWords, done);
    }
  }
}

function buildLevels(word, relatedWords, done) {
  var levelNames = sortWordsByPotential(relatedWords);
  if (levelNames.length < 4) {
    done(new Error('Could not find enough names for levels.'));
    return;
  }

  var probable = createProbable({
    random: seedrandom(word)
  });

  var totalLevels = 10 + probable.rollDie(Math.max(levelNames.length/2, 8));

  levelNames = levelNames.slice(0, totalLevels - 1);
  levelNames = levelNames.map(titleCase);
  levelNames = probable.shuffle(levelNames);

  var profile = {
    className: titleCase(word)
  };
  addRootPropertiesToProfile(probable, profile);

  var nameLevel = 9 + probable.roll(totalLevels/4);
  var nameLevelName = profile.className;
  if (probable.roll(3) == 0) {
    nameLevelName = levelNames.pop();
  }

  var levelNameDistribution = distributeNamesAcrossLevels({
    levelNames: levelNames,
    numberOfLevels: nameLevel - 1
  });

  levelNameDistribution.push(nameLevelName);

  console.log(levelNameDistribution);

  // TODO: Post-name-level stuff.

  // TODO: Make actual level objects.
  profile.levels = levelNameDistribution;
  done(null, profile);
}

function addRootPropertiesToProfile(probable, profile) {
  // TODO: Probability table instead of flat array.
  var hitDieNumber = probable.pickFromArray([2, 3, 4, 6, 8, 10, 12]);
  profile.hitDie = 'd' + hitDieNumber;
  if (hitDieNumber < 6) {
    profile.lateLevelHpGain = 1;
  }
  else if (hitDieNumber > 8) {
    profile.lateLevelHpGain = 3;
  }
  else {
    profile.lateLevelHpGain = 2;
  }
  return profile;
}

function distributeNamesAcrossLevels(opts) {
  var distribution = [];

  var levelNames;
  var numberOfLevels;

  if (opts) {
    levelNames = opts.levelNames;
    numberOfLevels = opts.numberOfLevels;
  }

  var levelsPerName = levelNames.length/numberOfLevels;
  console.log('levelsPerName', levelsPerName);
  var currentNameIndex = 0;

  levelNames.forEach(function addNameRepeatedly(levelName) {
    var numberOfTimesToUse = ~~levelsPerName;
    var repeated = repeat(levelName, numberOfTimesToUse);
    distribution = distribution.concat(repeated);
  });

  if (distribution.length < numberOfLevels) {
    var lastLevelName = levelNames[levelNames.length - 1];
    var filler = repeat(lastLevelName, numberOfLevels - distribution.length);
    distribution = distribution.concat(filler);
  }
  else if (distribution.length > numberOfLevels) {
    distribution = distribution.slice(0, numberOfLevels);
  }
  return distribution;
}

function repeat(x, n) {
  var repeated = [];
  for (var i = 0; i < n; ++i) {
    repeated.push(x);
  }
  return repeated;
}

var wordTypePreferenceOrder = [
  'synonym',
  'hyponym',
  'hypernym',
  'same-context'
];

function sortWordsByPotential(relatedWords) {
  var sortedCandidates = wordTypePreferenceOrder.reduce(concatIfTypeExists, []);

  function concatIfTypeExists(array1, wordType) {
    return concatIfExists(array1, relatedWords[wordType]);
  }

  return _.uniq(sortedCandidates).filter(isCool);
}

function concatIfExists(array1, array2) {
  if (array2) {
    return array1.concat(array2);
  }
  else {
    return array1;
  }
}

var matchWordsRegex = /[\w-]+/g;

function titleCase(str) {
  return str.replace(matchWordsRegex, titleCaseWord);
}

function titleCaseWord(word){
  return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
}

module.exports = {
  getNamedLevels: getNamedLevels
};
