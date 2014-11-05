/*
 * INIT
 */
function init() {
  var debouncedAnalyzeButton = _.debounce(function(){analyzeButtonPress();}, 1000);
  $('#file_input_button').on('click', debouncedAnalyzeButton);
  $('#add_specifier_button').on('click', addSpecifier);
  $('#remove_specifier_button').on('click', removeSpecifier);
  $('#file_input').on('change', loadFiles);
  removeAllFiles();
  addSpecifier('dontUpdateTypeahead');
  $('.specifier_container').hide();
  window.reader = new FileReader();
  window.reader.onloadend = function(e) {fileLoaded(e);};
}

function analyzeButtonPress() {
  chartData(getDatasetFromDOM(analyzeChunks(window.summedWordList)));
}

function removeAllFiles() {
  window.autocompleteTags = [];
  window.autocompleteNeedsUpdate = true;
  window.summedWordList = [];
  window.fileNameList = [];
  window.namedChunks = {};
}

function loadFiles(e) {
  if (!e.target || !e.target.files.length)
    return;
  var filesToLoad = e.target.files;
  window.filesLeft = [];
  window.autocompleteNeedsUpdate = true;
  window.numFiles = 0;
  _.each(filesToLoad, function(file) {
    window.numFiles++;
    window.filesLeft.push(file);
  });
  fileLoadingHelper(window.filesLeft.shift());
}

function fileLoaded(e) {
  // Grab the file contents
  var text = e.srcElement.result;

  // Clean up the text
  text = text.toLowerCase();
  text = text.replace(/\s/g, ' ');
  text = text.replace(/[^a-z ]/g, ' ');

  var textArr = text.split(' ');
  textArr = _.without(textArr, '');


  // Chunking into pieces for analysis over time
  var numChunks = $('#chunk_number_input').val() || Math.ceil(20/(window.numFiles+1));
  window.lastNumChunks = numChunks;
  var chunkSize = textArr.length / numChunks;
  var myChunks = [];

  for (var i = 0; i < numChunks; i++) {
    myChunks[i] = textArr.slice(i*chunkSize, (i+1)*chunkSize);
  }

  // add myChunks to the global chunk lists
  window.namedChunks[window.lastFileLoaded.name] = myChunks;
  window.fileNameList.push(window.lastFileLoaded.name);
  window.summedWordList = window.summedWordList.concat(myChunks);

  // recursively (through the onLoadEnd binding) process next file
  if (window.filesLeft.length) {
    fileLoadingHelper(window.filesLeft.shift());
  } else {
    analyzeChunks(window.summedWordList);
    updateFileDisplay();
    updateTypeahead();
  }
}

function fileLoadingHelper(file) {
  if (!file) {
    analyzeChunks(window.summedWordList);
    updateFileDisplay();
    updateTypeahead();
    return;
  }
  window.lastFileLoaded = file;
  if (window.namedChunks[file.name]) {
    window.summedWordList = window.summedWordList.concat(window.namedChunks[file.name]);
    fileLoadingHelper(window.filesLeft.shift());
  } else {
    window.reader.readAsText(file);
  }
}

function analyzeChunks(chunks) {
   // Get dicts of word usage and lists of most common words for each chunk
  var dicts = [];
  var sortedKeys = [];
  window.autocompleteTags = {};

  _.each(chunks, function(chunk, indx) {
    var myDict = {};

    _.each(chunk, function(word, indx, wordList) {
      if (!myDict[word]) {
        myDict[word] = 0;
      }
      myDict[word]++;
    });

    var mySortedKeys = [];
    for (var key in myDict) {
      mySortedKeys.push(key);
      window.autocompleteTags[key] = 1;
    }
    mySortedKeys = mySortedKeys.sort(function(a,b){return myDict[b]-myDict[a];});

    dicts.push(myDict);
    sortedKeys.push(mySortedKeys);
  });

  return dicts;
}

function getDatasetFromDOM(dicts) {
  var container = $('.specifier_container');
  var dataset = {};
  var colorset = {};
  _.each(container.children(), function(child, indx) {
    var myColor = $(child.childNodes[1]).spectrum("get");
    var text = $(child.childNodes[0].childNodes[0]).tokenfield("getTokensList");
    text = text.toLowerCase();
    text = text.replace(/\s/g, ' ');
    text = text.replace(/[^a-z ]/g, ' ');
    text = text.replace(/\s+/g, ' ');

    var myList = text.split(' ');
    myList = _.without(myList, '');

    dataset[myList[0]] = getChartEntryForWordList(dicts, myList);
    colorset[myList[0]] = myColor.toRgbString();
  });
  return [dataset, colorset];
}

function getChartEntryForWordList(dicts, wordList) {
  var out = [];
  _.each(dicts, function(dict, indx) {
    out[indx] = 0;
    _.each(wordList, function(word) {
      if(dict[word]) {
        out[indx] += dict[word];
      }
    });
  });
  return out;
}

function chartData(dataContainer) {
  var dataArr = dataContainer[0];
  var colorArr = dataContainer[1];
  var keys = Object.keys(dataArr);
  var numSets = keys.length;
  var labels = [];
  var dataSets = [];
  var countUp = 0;
  for (var i = 1; i <= window.numFiles; i++) {
    for (var j = 1; j <= window.lastNumChunks; j++) {
      labels.push(i + '.' + j);
    }
  }
  _.each(dataArr, function(val, key) {
    var mySet = {
      fillColor: colorArr[key],
      strokeColor: colorArr[key],
      pointColor: colorArr[key],
      pointStrokeColor: '#fff',
      label: key,
      data: val
    };
    dataSets.push(mySet);
  });

  var data = {
    labels: labels,
    datasets: dataSets
  };

  var ctx = resetCanvas();
  $('.section.results').slideDown();
  window.myChart = new Chart(ctx).Line(data);
  legend($('#legend')[0], data);

}

function resetCanvas() {
  $('#chart').remove();
  $('.section.results').prepend($('<canvas id="chart"><canvas>'));
  canvas = $('#chart')[0];
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $(window).width(); // resize to parent width
  ctx.canvas.height = 600;
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
  ctx.fillText('This text is centered on the canvas', x, y);
  return ctx;
}

function updateTypeahead() {
  if (window.autocompleteNeedsUpdate){

    window.engine = new Bloodhound({
      local: _.map(_.keys(window.autocompleteTags), function(word) {return {value: word};}),
      datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });

    window.engine.initialize();

    _.each($('.specifier'), function(textField) {
      $(textField).tokenfield({
        typeahead: [null, { source: window.engine.ttAdapter() }]
      });
    });
    $('.specifier_container').slideDown();
  }
  window.autocompleteNeedsUpdate = false;
}

function updateFileDisplay() {
  var fileList = $('.files_container');
  fileList.sortable();
  fileList.disableSelection();
  _.each(window.fileNameList, function(fileName) {
    var myRow = $('<li class="fileName">' + fileName + '</li>');
    fileList.append(myRow);
  });
}

function addSpecifier(dontUpdateTypeahead) {
  var container = $('.specifier_container');
  var myNum = container[0].children.length+1;
  var myRow = $('<div class="specifier_row"/>');
  myRow.append($('<input type="text" placeholder="Enter list to display as dataset ' + myNum + '. Title will be first word."/>').addClass('specifier text_input'));
  myRow.append($('<input type="text" class="colorpicker ' + myNum + '" />'));

  container.append(myRow);
  $('.colorpicker.' + myNum).spectrum({
    color: '#'+Math.floor(Math.random()*16777215).toString(16),
    showAlpha: true
  });
  window.autocompleteNeedsUpdate = true;
  if (dontUpdateTypeahead == "dontUpdateTypeahead")
    return;
  updateTypeahead();
}

function removeSpecifier() {
  var container = $('.specifier_container');
  if (container[0].length < 2)
    return;
  $('.specifier_container').children().last().remove();
}
