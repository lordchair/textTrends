
function textToChunks(textToProcess, numChunks_) {
  var text = textToProcess;
  var numChunks = numChunks_ || 1;

  // Clean up the text
  text = text.toLowerCase();
  text = text.replace(/\s/g, ' ');
  text = text.replace(/[^a-z ]/g, '');

  var textArr = text.split(' ');
  textArr = _.without(textArr, '');

  var chunkSize = textArr.length / numChunks;
  var myChunks = [];

  for (var i = 0; i < numChunks; i++) {
    myChunks[i] = textArr.slice(i*chunkSize, (i+1)*chunkSize);
  }

  return myChunks;
}

function chunksToFreqs(chunks) {
  var freqs = [];
  var summary = {};

  _.each(chunks, function(chunk, indx) {
    var chunkFreqDict = {};

    _.each(chunk, function(word, indx, wordList) {
      if (!chunkFreqDict[word]) {
        chunkFreqDict[word] = 0;
      }
      if (!summary[word]) {
        summary[word] = 0;
      }
      chunkFreqDict[word]++;
      summary[word]++;
    });

    freqs.push(chunkFreqDict);
  });

  return {
    summary: summary,
    freqs: freqs
  };
}

function freqsToTopWordLists(freqs) {
  var sortedKeys = [];
  _.each(freqs, (myDict) => {
    var mySortedKeys = [];
    for (var key in myDict) {
      mySortedKeys.push(key);
    }
    mySortedKeys = mySortedKeys.sort(function(a,b){return myDict[b]-myDict[a];});
    sortedKeys.push(mySortedKeys);
  });
}

function freqsToAutocompleteInfo(freqs) {
  autocompleteTags = {};

  _.each(freqs, (myDict) => {
    for (var key in myDict) {
      autocompleteTags[key] = 1;
    }
  });

  return autocompleteTags;
}

function combineIntegerDicts(...dictionaries) {
  if (!dictionaries || !dictionaries.length) { return; }
  if (dictionaries[0].constructor === Array) { return combineIntegerDicts(...dictionaries[0]); }
  const output = dictionaries[0];
  for (let i = 1; i < dictionaries.length; i++) {
    for (const item in dictionaries[i]) {
      const startValue = output[item] || 0;
      output[item] = dictionaries[i][item] + startValue;
    }
  }
  return output;
}

module.exports = { textToChunks, chunksToFreqs, freqsToAutocompleteInfo, freqsToTopWordLists, combineIntegerDicts };