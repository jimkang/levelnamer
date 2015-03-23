var createWordnok = require('wordnok').createWordnok;
var config = require('./config');
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var _ = require('lodash');
var createIsCool = require('iscool');
var createAggrandizer = require('aggrandizer').create;
var differentiateLevelNames = require('./differentiate-level-names');
var callBackOnNextTick = require('conform-async').callBackOnNextTick;
var jsonfile = require('jsonFile');

var baseIsCool = createIsCool();
var hypernymIsCool = createIsCool({
  customBlacklist: jsonfile.readFileSync(
    __dirname + '/custom-blacklists/hypernyms.json'
  )
});

var sameContextIsCool = createIsCool({
  customBlacklist: jsonfile.readFileSync(
    __dirname + '/custom-blacklists/same-context-words.json'
  )
});

function getNamedLevels(opts, done) {
  var word;
  var wordnok;
  var totalLevels;

  if (opts) {
    word = opts.word;
    wordnok = opts.wordnok;
    totalLevels = opts.totalLevels;
  }

  if (!totalLevels) {
    throw new Error('totalLevels not given to getNamedLevels');
  }
  if (!word) {
    throw new Error('word not given to getNamedLevels.');
  }
  if (!baseIsCool(word)) {
    throw new Error('Uncool word provided to getNamedLevels.');
  }

  word = word.toLowerCase();

  if (!wordnok) {
    var wordnokOpts = {
      apiKey: config.wordnikAPIKey
    };
    if (opts.memoizeServerPort) {
      wordnokOpts.memoizeServerPort = opts.memoizeServerPort;
    }
    wordnok = createWordnok(wordnokOpts);
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
      prioritizeWords(wordnok, relatedWords, sendToBuildLevels);
    }
  }

  function sendToBuildLevels(error, prioritizedRelatedWords) {
    if (error) {
      done(error);
    }
    else {
      buildLevels(word, prioritizedRelatedWords, totalLevels, done);
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

function buildLevels(word, prioritizedRelatedWords, totalLevels, done) {
  var levelNames = prioritizedRelatedWords;
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

  var nameLevelName = titleCase(word);

  if (levelNames.length < 1) {
    levelNames = generateSubordinateNames(
      nameLevelName, 2 + probable.rollDie(6), probable
    );
  }

  levelNames = levelNames.slice(0, totalLevels - 1);
  levelNames = levelNames.map(titleCase);
  levelNames = probable.shuffle(levelNames);

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

  done(null, levelNameDistribution);
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
  // console.log('namesPerLevel', namesPerLevel);
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

function prioritizeWords(wordnok, relatedWords, done) {
  var sortedCandidates = wordTypePreferenceOrder.reduce(concatIfTypeExists, []);

  if (sortedCandidates.length < 5) {
    // Some of them are bad, they're all likely to be terrible, so just skip 
    // 'em all.
    if (relatedWords.hypernym && relatedWords.hypernym.every(hypernymIsCool)) {
      sortedCandidates = concatIfTypeExists(sortedCandidates, 'hypernym');
    }
  }

  if (sortedCandidates.length < 5) {
    if (relatedWords['same-context'] && 
      relatedWords['same-context'].every(sameContextIsCool)) {

      sortedCandidates = concatIfTypeExists(sortedCandidates, 'same-context');
    }
  }

  function concatIfTypeExists(array1, wordType) {
    return concatIfExists(array1, relatedWords[wordType]);
  }
  // console.log('relatedWords', relatedWords);

  sortedCandidates = _.uniq(sortedCandidates).filter(baseIsCool);
  filterOutNonNouns(wordnok, sortedCandidates, done);
}

function concatIfExists(array1, array2) {
  if (array2) {
    return array1.concat(array2);
  }
  else {
    return array1;
  }
}

function filterOutNonNouns(wordnok, words, done) {
  wordnok.getPartsOfSpeechForMultipleWords(words, applyFilter);
  function applyFilter(error, partsOfSpeechArray) {    
    var filtered;

    if (error) {
      done(error);
    }
    else {
      filtered = words.filter(wordCorrespondsToANoun);
    }

    function wordCorrespondsToANoun(word, i) {
      var partsOfSpeech = partsOfSpeechArray[i];
      return partsOfSpeech.indexOf('noun') !== -1 || 
        partsOfSpeech.indexOf('proper-noun') !== -1;
    }

    done(error, filtered);
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
