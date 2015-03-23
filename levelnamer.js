var createWordnok = require('wordnok').createWordnok;
var config = require('./config');
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var _ = require('lodash');
var createIsCool = require('iscool');
var createAggrandizer = require('aggrandizer').create;
var differentiateLevelNames = require('./differentiate-level-names');
var callBackOnNextTick = require('conform-async').callBackOnNextTick;

var isCool = createIsCool();

function getNamedLevels(opts, done) {
  var word;
  var wordnok;

  if (opts) {
    word = opts.word;
    wordnok = opts.wordnok;
  }

  if (!word) {
    throw new Error('word not given to getNamedLevels.');
  }
  if (!isCool(word)) {
    throw new Error('Uncool word provided to getNamedLevels.');
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

var subordinatePrefixes = [
  'Junior',
  'Apprentice',
  'Assistant',
  'Associate',
  'Minor',
  'Novice',
  'Cadet',
  'Student',
  'Trainee',
  'Intern',
  'Lesser'
];

function generateSubordinateNames(base, count, probable) {
  function appendBase(prefix) {
    return prefix + ' ' + base;
  }
  return probable.shuffle(subordinatePrefixes).slice(count).map(appendBase);
}

function buildLevels(word, relatedWords, done) {
  var levelNames = sortWordsByPotential(relatedWords);
  // if (levelNames.length < 4) {
  //   // Helpful user tip: Maybe check Unearthed Arcana.
  //   done(new Error('Could not find enough names for levels.'));
  //   return;
  // }

  var probable = createProbable({
    random: seedrandom(word)
  });

  var aggrandizer = createAggrandizer({
    probable: probable
  });

  var profile = {
    className: titleCase(word)
  };
  var nameLevelName = profile.className;

  if (levelNames.length < 1) {
    levelNames = generateSubordinateNames(
      nameLevelName, 2 + probable.rollDie(6), probable
    );
  }

  var totalLevels = 12 + probable.rollDie(Math.max(levelNames.length/2, 8));

  levelNames = levelNames.slice(0, totalLevels - 1);
  levelNames = levelNames.map(titleCase);
  levelNames = probable.shuffle(levelNames);

  addRootPropertiesToProfile(probable, profile);

  var nameLevel = 9 + probable.roll(totalLevels/4);
  
  var levelNameDistribution = distributeNamesAcrossLevels({
    levelNames: levelNames,
    numberOfLevels: nameLevel - 1
  });

  levelNameDistribution.push(nameLevelName);

  var masterLevelTitles = aggrandizer.aggrandize({
    baseTitle: nameLevelName,
    iterations: totalLevels - nameLevel
  });
  var titleGender = probable.roll(2);
  var formatTitleWithGender = _.curry(aggrandizer.formatTitle)(titleGender);
  var masterLevelNames = masterLevelTitles.map(formatTitleWithGender);

  levelNameDistribution = levelNameDistribution.concat(masterLevelNames);
  levelNameDistribution = differentiateLevelNames(levelNameDistribution);

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

  var namesPerLevel = numberOfLevels/levelNames.length;
  console.log('namesPerLevel', namesPerLevel);
  var currentNameIndex = 0;

  levelNames.forEach(function addNameRepeatedly(levelName) {
    var numberOfTimesToUse = Math.max(~~namesPerLevel, 1);
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
  // 'form',
  // 'variant',
  // 'cross-reference'
];

function sortWordsByPotential(relatedWords) {
  var sortedCandidates = wordTypePreferenceOrder.reduce(concatIfTypeExists, []);

  if (sortedCandidates.length < 5) {
    sortedCandidates = concatIfTypeExists(sortedCandidates, 'hypernym');
  }

  if (sortedCandidates.length < 5) {
    sortedCandidates = concatIfTypeExists(sortedCandidates, 'same-context');
  }

  function concatIfTypeExists(array1, wordType) {
    return concatIfExists(array1, relatedWords[wordType]);
  }
  console.log('relatedWords', relatedWords);

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
