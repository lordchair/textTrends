const React = require('react');
var tinycolor = require('tinycolor2');
var LineTooltip = require('react-d3-tooltip').LineTooltip;
var SimpleTooltipStyle = require('react-d3-tooltip').SimpleTooltip;

const Results = React.createClass({
  propTypes: {
    dataSet: React.PropTypes.array,
    filesToChart: React.PropTypes.array,
    categories: React.PropTypes.array,

  },
  getInitialState() {
    return {
      width: 600,
      height: 600
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
  buildChartData(dataSet, categories, filesToChart) {
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

  render() {
    return (
      <div className='results_chart'>
        <LineTooltip width={this.state.width - 150} height={600} brushHeight={100} data={this.buildChartData(this.props.dataSet, this.props.categories, this.props.filesToChart)} chartSeries={this.buildChartInfo(this.props.categories)} x={this.x} interpolate='monotone'>
          <SimpleTooltipStyle/>
        </LineTooltip>
      </div>
    );
  }
});

module.exports = Results;
