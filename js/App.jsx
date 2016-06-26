const React = require('react');
const Header = require('./Header.jsx');
const Sidebar = require('./Sidebar.jsx');
const Content = require('./Content.jsx');
const Spinner = require('./Spinner.jsx');
const { asoif, lotr } = require('./constants.js');
const { textToChunks, chunksToFreqs, freqsToAutocompleteInfo, freqsToTopWordLists } = require('./textProcessing.js');

const App = React.createClass({
  getInitialState() {
    return {
      fileNameList: [],
      filesLeft: 0,
      categories: [],
      autocompleteTags: []
    }
  },

  componentWillMount() {
    this.reader = new FileReader();
    this.analyzed = [{ // example
      name: 'fileName',
      numChunks: 1,
      chunkSummary: [],
      chunks: [],
      freqSummary: {},
      freqs: {}
    }];
    this.analyzed = [];
    this.removeAllFiles();
  },

  removeAllFiles() {
    this.setState(this.getInitialState());
    this.autocompleteTags = [];
    this.summedWordList = [];
    this.toProcess = [];
    this.numChunks = 5;
  },

  analyzeAllData() {
    this.updateAutocomplete();
    // $('.add_category').removeClass('unloaded');
    // updateFileDisplay();
    // updateTypeahead();

    // var toSort = $('.files_container').children();
    // $('.files_container').empty();
    // toSort.sort(function (a, b) {
    //   return ($(a).text().toLowerCase() > $(b).text().toLowerCase());
    // });
    // _.each(toSort, function(me) { $('.files_container').append(me);});
    // $('.loading_overlay').removeClass('active');
  },

  updateAutocomplete() {
    const fileNameList = this.state.fileNameList;
    let autocompleteWords = [];
    for (let i = 0; i < fileNameList.length; i++) {
      const name = fileNameList[i];
      const data = _.find(this.analyzed, (obj) => obj.fileName === name);
      if (!data || !data.freqSummary) {
        console.warn('updateAutocomplete recieved null data for file: ' + name);
        continue;
      }
      autocompleteWords = _.union(_.keys(data.freqSummary), autocompleteWords);
    }
    this.setState({
      autocompleteTags: autocompleteWords
    });
  },

  onPresetPicked(preset) {
    let toProcess;
    switch (preset) {
      case 'asoif': toProcess = asoif; break;
      case 'lotr': toProcess = lotr; break;
      default: return;
    }
    this.removeAllFiles();
    const fileNames = _.keys(toProcess);
    this.setState({ fileNameList: fileNames , filesLeft: fileNames.length });

    this.numChunks = Math.ceil(20/(this.state.filesLeft+1));
    this.toProcess = _.map(toProcess, (val, key) => { return { name: key, url: val }; });

    this.processNextFile();
  },

  processNextFile(file_) {
    if (!file_ && !this.toProcess.length) {
      return;
    }

    const file = file_ || this.toProcess.shift();

    const existingData = _.find(this.analyzed, (datum) => datum.fileName === file.name);
    if (existingData) {
      if (existingData.numChunks !== this.numChunks) {
        // rechuk
      }
      this.summedWordList = this.summedWordList.concat(existingData.chunks);
      this.setState({ filesLeft: this.state.filesLeft - 1});
    } else if (file.name && file.url) {
      $.get(file.url, this.buildProcessingFunc(file.name));
    } else {
      this.reader.onloadend = this.buildProcessingFunc(file.name);
      this.reader.readAsText(file);
    }
    this.processNextFile();
  },

  buildProcessingFunc(myName) {
    return function(data_) {
      let data = data_;
      if (data_ && data_.srcElement && data_.srcElement.result) {
        data = data_.srcElement.result;
      }
      const myData = {
        fileName: myName,
        numChunks: this.numChunks,
        chunks: textToChunks(data, this.numChunks),
        chunkSummary: textToChunks(data, 1),
      }
      const freqInfo = chunksToFreqs(myData.chunks);
      myData.freqSummary = freqInfo.summary;
      myData.freqs = freqInfo.freqs;

      this.analyzed.push(myData);
      this.setState({ filesLeft: this.state.filesLeft - 1 });
      if (this.state.filesLeft <= 0) {
        this.analyzeAllData();
      }
    }.bind(this);
  },

  onUploadPicked(e) {
    if (!e.target || !e.target.files.length) { return; }
    this.removeAllFiles();

    this.toProcess = e.target.files;
    this.setState({ fileNameList: _.map(this.toProcess, (file) => file.name), filesLeft: this.toProcess.length });
    this.numChunks = Math.ceil(20/(this.toProcess.length+1));

    this.processNextFile();
  },

  onAddToCategory(id, word, updateType) {
    if (!id || !id.indexOf('cat') === 0) {
      this.setState({
        categories: [...this.state.categories, { id: _.uniqueId('cat'), words: [] }]
      });
    } else if (!word) {
      return;
    } else if (updateType === 'color') {
      const newValue = _.find(this.state.categories, (category) => category.id === id);
      const index = this.state.categories.indexOf(newValue);
      newValue.color = word;
      this.setState({
        categories: [...this.state.categories.slice(0, index), newValue, ...this.state.categories.slice(index+1)]
      });
    } else {
      const newValue = _.find(this.state.categories, (category) => category.id === id);
      const index = this.state.categories.indexOf(newValue);
      newValue.words.push(word);
      this.setState({
        categories: [...this.state.categories.slice(0, index), newValue, ...this.state.categories.slice(index+1)]
      });
    }
  },

  onRemoveFromCategory(id, word) {
    if (!id) { return; }
    const newValue = _.find(this.state.categories, (category) => category.id === id);
    const index = this.state.categories.indexOf(newValue);
    if (!word) {
      this.setState({
        categories: [...this.state.categories.slice(0, index), ...this.state.categories.slice(index+1)]
      });
    } else {
      newValue.words = _.without(newValue.words, word);
      this.setState({
        categories: [...this.state.categories.slice(0, index), newValue, ...this.state.categories.slice(index+1)]
      });
    }
  },



  render() {

    return (
      <div className='App'>
        <Spinner total={this.state.fileNameList.length} remaining={this.state.filesLeft} />
        <Header onAnalyzeClicked={} onResetClicked={this.removeAllFiles}/>
        <div className="body">
          <Sidebar onFilePreset={this.onPresetPicked} onFileUploaded={this.onUploadPicked} fileNames={this.state.fileNameList} />
          <Content categories={this.state.categories} autocompleteTags={this.state.autocompleteTags} onAddToCategory={this.onAddToCategory} onRemoveFromCategory={this.onRemoveFromCategory} />
        </div>
      </div>
    );
  }
});

module.exports = App;
