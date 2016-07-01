const React = require('react');
const tinycolor = require('tinycolor2');
var SimpleTooltipStyle = require('react-d3-tooltip').SimpleTooltip;
var LineTooltip = require('react-d3-tooltip').LineTooltip;

const LineChart = require('./Chart/LineChart.jsx');



const Results = React.createClass({
  propTypes: {
    dataSet: React.PropTypes.array,
    filesToChart: React.PropTypes.array,
    categories: React.PropTypes.array,
    graphOptions: React.PropTypes.object
  },
  getInitialState() {
    return {
      width: 600,
      height: 600,
      graphOptions: { interpolation: 'monotone', yScaleType: 'linear' }
    };
  },
  componentWillMount: function() {
    this.updateDimensions();
  },
  componentDidMount: function() {
    window.addEventListener('resize', this.updateDimensions);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.updateDimensions);
  },
  updateDimensions: function() {
    var w = window,
    d = document,
    documentElement = d.documentElement,
    body = d.getElementsByTagName('body')[0],
    width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
    height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    this.setState({width: width, height: height});
  },

  x(d) {
    return d.index;
  },
  deprecatedBuildChartData(dataSet, categories, filesToChart) {
    var output = [];
    for (let d = 0; d < filesToChart.length; d++) {
      const data = _.find(dataSet, (datum) => datum.fileName === filesToChart[d]);
      for (let f = 0; f < data.freqs.length; f++) {
        const freq = data.freqs[f];
        let outputEntry = { index: f };
        if (output.length > f) {
          outputEntry = output[f];
        }
        for (let c = 0; c < categories.length; c++) {
          const words = categories[c].words;
          const categoryName = words[0];
          for (let w = 0; w < words.length; w++) {
            const word = words[w];
            const count = freq[word] || 0;
            outputEntry[categoryName] = outputEntry.hasOwnProperty(categoryName) ? outputEntry[categoryName] + count : count;
          }
        }
        output[f] = outputEntry;
      }
    }
    return output;
  },

  buildChartInfo(categories) {
    var output = [];
    for (let c = 0; c < categories.length; c++) {
      const category = categories[c];
      if (!category || !category.words || !category.words.length) { continue; }
      output.push({
        field: category.words[0],
        name: category.words[0],
        color: tinycolor(category.color).setAlpha(1).toRgbString(),
        area: true,
        style: {
          strokeWidth: 2,
          strokeOpacity: 1,
          fillOpacity: .3
        }
      });
    }
    return output;
  },

  buildChartData(dataSet, categories, filesToChart) {
    const points = [];
    let maxY = 0;
    for (let c = 0; c < categories.length; c++) {
      const words = categories[c].words;
      const wordsUsageFromData = [];
      for (let d = 0; d < filesToChart.length; d++) {
        const data = _.find(dataSet, (datum) => datum.fileName === filesToChart[d]);
        for (let f = 0; f < data.freqs.length; f++) {
          const freq = data.freqs[f];
          const wordFreqs = this.getWordListUsageFromFreq(freq, words);
          wordsUsageFromData.push({ x: d*data.freqs.length + f, y: wordFreqs });
          maxY = Math.max(maxY, wordFreqs);
        }
      }
      points.push(wordsUsageFromData);
    }
    return {
      points: points,
      xValues: points[0].map((obj) => obj.x),
      yMin: 0,
      yMax: maxY
    }
    return output;
  },

  getWordListUsageFromFreq(freq, wordList) {
    let out = 0;
    for (let w = 0; w < wordList.length; w++) {
      const word = wordList[w];
      const count = freq[word] || 0;
      out += count;
    }

    return out;
  },


  render() {
    let chart;
    if (this.props.graphOptions && this.props.graphOptions.useOldGraph) {
      chart = (
        <LineTooltip width={this.state.width} height={600} brushHeight={100} data={this.deprecatedBuildChartData(this.props.dataSet, this.props.categories, this.props.filesToChart)} chartSeries={this.buildChartInfo(this.props.categories)} x={this.x} interpolate='monotone'>
          <SimpleTooltipStyle/>
        </LineTooltip>
      );
    } else {
      chart = (
        <LineChart
          width={this.state.width}
          height={600}
          options={this.props.graphOptions}
          colors={this.props.categories.map((obj) => obj.color)}
          data={this.buildChartData(this.props.dataSet, this.props.categories, this.props.filesToChart)} />
      );
    }
    return (
      <div className='section results'>
        {chart}
      </div>
    );
  }
});

module.exports = Results;
