/*
 * INIT
 */
function init() {
  var debouncedAnalyzeButton = _.debounce(function(){analyzeButtonPress();}, 1000);
  var debouncedResize = _.debounce(function(){resizeHelper();}, 100);
  $(window).on('resize', debouncedResize);
  $('#file_input_button').on('click', debouncedAnalyzeButton);
  $('.external_file').on('click', chooseFilesButton);
  $('.activate.button').on('click', debouncedAnalyzeButton);
  $('.add_specifier').on('click', addSpecifier);
  $('#file_input').on('change', loadFiles);
  removeAllFiles();
  $('.specifier_container').sortable();
  window.reader = new FileReader();
  resizeHelper();
}

function chooseFilesButton(e) {
  debugger;
  $.get('text/ASOIF/', function(data) {
    debugger;
  });
}

function analyzeButtonPress() {
  var toAnalyze = [];
  var fileNames = $('.ui-sortable').sortable('toArray', {attribute: 'id'});
  _.each(fileNames, function(name) {
    toAnalyze = toAnalyze.concat(window.namedChunks[name]);
  });
  chartData(getDatasetFromDOM(analyzeChunks(toAnalyze)), fileNames);
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
  removeAllFiles();
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

function fileLoaded(e, file) {
  // Grab the file contents
  processText(e.srcElement.result, file.name);

  // recursively (through the onLoadEnd binding) process next file
  var continues = (window.filesLeft.length) ? window.filesLeft.shift() : false;
  fileLoadingHelper(continues);
}

function fileLoadingHelper(file) {
  if (!file) {
    analyzeChunks(window.summedWordList);
    window.autocompleteNeedsUpdate = true;
    updateFileDisplay();
    updateTypeahead();
    return;
  }
  if (window.namedChunks[file.name]) {
    window.summedWordList = window.summedWordList.concat(window.namedChunks[file.name]);
    fileLoadingHelper(window.filesLeft.shift());
  } else {
    window.reader.onloadend = (  function(myFile) {
       return function(evt) { fileLoaded(evt, myFile); };
    })(file);
    window.reader.readAsText(file);
  }
}

function processText(textToProcess, name) {
  var text = textToProcess;

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
  window.namedChunks[name] = myChunks;
  window.fileNameList.push(name);
  window.summedWordList = window.summedWordList.concat(myChunks);
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

//super brittle function, grabs user input directly, I broke most of it by changing HTML ordering
function getDatasetFromDOM(dicts) {
  var container = $('.specifier_container');
  var dataset = {};
  var colorset = {};
  _.each(container.children(), function(child, indx) {
    var myColor = $(child.childNodes[2]).spectrum("get");
    var text = $(child.childNodes[4].childNodes[0]).tokenfield("getTokensList");
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

function chartData(dataContainer, fileNames) {
  var dataArr = dataContainer[0];
  var colorArr = dataContainer[1];
  var keys = Object.keys(dataArr);
  var numSets = keys.length;
  var labels = [];
  var dataSets = [];
  var countUp = 0;
  for (var i = 1; i <= window.numFiles; i++) {
    for (var j = 1; j <= window.lastNumChunks; j++) {
      if (fileNames && fileNames[i-1]) {
        labels.push(fileNames[i-1].replace(/[^a-zA-Z ]/g, ' ').match(/[a-zA-Z0-9]+.[a-zA-Z0-9]+/) + '.' + j);
      } else {
        labels.push(i + '.' + j);
      }
    }
  }
  _.each(dataArr, function(val, key) {
    var mySet = {
      fillColor: colorArr[key],
      strokeColor: '#000',
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
  $('.section.results').append($('<canvas id="chart"><canvas>'));
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
    if (!$('.specifier').length) {
      addSpecifier('dontUpdateTypeahead');
    }

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
    $('.subsection.specifiers').slideDown();
  }
  window.autocompleteNeedsUpdate = false;
}

function updateFileDisplay() {
  var fileList = $('.files_container');
  fileList.empty();
  fileList.sortable();
  fileList.disableSelection();
  _.each(window.fileNameList, function(fileName) {
    var myRow = $('<li class="fileName" id="' + fileName + '">' + fileName + '</li>');
    fileList.append(myRow);
  });
}

function addSpecifier(dontUpdateTypeahead) {
  var container = $('.specifier_container');
  var myId = _.uniqueId('spec_');
  var myNum = container[0].children.length+1;
  var myRow = $('<li class="specifier_row" style="display:none;"/>');
  myRow.append($('<i class="remove_row_button row_item fa fa-remove"></i>'));
  myRow.append($('<i class="row_item reorder_row_icon fa fa-bars"></i>'));
  myRow.append($('<input type="text" class="colorpicker ' + myId + '" />'));
  myRow.append($('<input type="text"/>').addClass('specifier text_input'));

  var myColor = tinycolor.random();
  myColor.setAlpha(0.3);

  container.append(myRow);
  $('.colorpicker.' + myId).spectrum({
    color: myColor.toRgbString(),
    showAlpha: true
  });
  $('.remove_row_button').on('click', removeSpecifier);
  _.defer(function() {resizeHelper(); myRow.slideDown(300);});

  window.autocompleteNeedsUpdate = true;
  if (dontUpdateTypeahead == "dontUpdateTypeahead")
    return;
  updateTypeahead();
}

function removeSpecifier(e) {
  $(e.target.parentElement).slideUp(function(x) {
    this.remove();
  });
}

function getFileFromServer(url, doneCallback) {
  var xhr;

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = handleStateChange;
  xhr.open("GET", url, true);
  xhr.send();

  function handleStateChange() {
    if (xhr.readyState === 4) {
      doneCallback(xhr.status == 200 ? xhr.responseText : null);
    }
  }
}

function resizeHelper() {
  $('.main_content').width($(window).width() - 260 - 5);
  _.each($('.form-control.tokenfield'), function(row) {
    $(row).width($(window).width() - 260 - 150 - 5);
  });
}