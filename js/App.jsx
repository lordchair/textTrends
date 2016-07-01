const React = require('react');
const Header = require('./Header.jsx');
const Sidebar = require('./Sidebar.jsx');
const Content = require('./Content.jsx');
const Spinner = require('./Spinner.jsx');
const Results = require('./Results.jsx');
const Instructions = require('./Instructions.jsx');
const { asoif, lotr } = require('./constants.js');
const { textToChunks, chunksToFreqs, combineIntegerDicts, chunkArray } = require('./textProcessing.js');

const App = React.createClass({
  getInitialState() {
    return {
      fileNameList: [],
      filesLeft: 0,
      categories: (this.state && this.state.categories) || [],
      frequencyDictionary: {},
      sortedWordList: [],
      graphOptions: (this.state && this.state.graphOptions) || { useOldGraph: false, interpolation: 'monotone', yScaleType: 'linear' },
      desiredChunks: (this.state && this.state.desiredChunks) || 20
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
    this.toProcess = [];
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
      if (existingData.numChunks !== this.state.desiredChunks) {
        // rechuk
      }
      const frequencyDictionaryUpdate = combineIntegerDicts(this.state.frequencyDictionary, existingData.freqSummary);
      this.setState({
        filesLeft: this.state.filesLeft - 1,
        frequencyDictionary: frequencyDictionaryUpdate,
        sortedWordList: Object.keys(frequencyDictionaryUpdate).sort(function(a,b){return frequencyDictionaryUpdate[b]-frequencyDictionaryUpdate[a]})
      });
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
        numChunks: this.state.desiredChunks
      };
      myData.chunkSummary = textToChunks(data)[0];
      myData.chunks = chunkArray(myData.chunkSummary, myData.numChunks);
      const freqInfo = chunksToFreqs(myData.chunks);
      myData.freqSummary = freqInfo.summary;
      myData.freqs = freqInfo.freqs;

      this.analyzed.push(myData);

      const frequencyDictionaryUpdate = combineIntegerDicts(this.state.frequencyDictionary, myData.freqSummary);
      this.setState({
        filesLeft: this.state.filesLeft - 1,
        frequencyDictionary: frequencyDictionaryUpdate,
        sortedWordList: Object.keys(frequencyDictionaryUpdate).sort(function(a,b){return frequencyDictionaryUpdate[b]-frequencyDictionaryUpdate[a]})
      });
      if (this.state.filesLeft <= 0) {
        // DONE LOADING
        while(this.state.categories.length < 2) {
          this.onAddToCategory();
        }
      }
    }.bind(this);
  },

  onUploadPicked(e) {
    if (!e.target || !e.target.files.length) { return; }
    this.removeAllFiles();
    this.toProcess = e.target.files;
    this.setState({ fileNameList: _.map(this.toProcess, (file) => file.name), filesLeft: this.toProcess.length });
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

  updateChunkNumber(number) {
    if (number !== this.state.desiredChunks) {
      for (let i = 0; i < this.state.fileNameList.length; i++) {
        const updated = _.find(this.analyzed, (datum) => datum.fileName === this.state.fileNameList[i]);
        updated.numChunks = number;
        updated.chunks = chunkArray(updated.chunkSummary, number);
        const freqInfo = chunksToFreqs(updated.chunks);
        updated.freqs = freqInfo.freqs;
      }
      this.setState({ desiredChunks: number });
    }
  },




  render() {
    let results = null;
    if (!this.state.filesLeft && this.state.categories.length && this.state.categories[0].words.length) {
      results = (
        <Results
          dataSet={this.analyzed}
          categories={this.state.categories}
          graphOptions={this.state.graphOptions}
          filesToChart={this.state.fileNameList} />
      );
    }

    return (
      <div className='App'>
        <Spinner total={this.state.fileNameList.length} remaining={this.state.filesLeft} />
        <Header onResetClicked={this.removeAllFiles}/>
        <Content categories={this.state.categories} results={results} autocompleteTags={this.state.sortedWordList} onAddToCategory={this.onAddToCategory} onRemoveFromCategory={this.onRemoveFromCategory}>
          <Sidebar
            onFilePreset={this.onPresetPicked}
            onFileUploaded={this.onUploadPicked}
            numChunks={Number.parseInt(this.state.desiredChunks)}
            updateChunkNumber={this.updateChunkNumber}
            updateGraphOption={(optionName, newValue) => { if (newValue !== this.state.graphOptions.optionName) { const updated = this.state.graphOptions; updated[optionName] = newValue; this.setState({ graphOptions: updated })}}}
            selectedGraphOptions={this.state.graphOptions}
            fileNames={this.state.fileNameList} />
          <Instructions/>
        </Content>
      </div>
    );
  }
});

module.exports = App;
