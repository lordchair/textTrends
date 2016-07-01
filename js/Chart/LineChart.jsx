const React = require('react');
const d3 = require('d3');
const DataSeries = require('./DataSeries.jsx');

const LineChart = React.createClass({

  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.object.isRequired,
    colors: React.PropTypes.array,
    options: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      width: 600,
      height: 300,
      options: {
        yScaleType: 'linear',
        interpolation: 'monotone'
      }
    }
  },

  render() {
    let { width, height, data, options, colors } = this.props;
    let yScaleType = options.yScaleType || 'linear';
    let interpolation = options.interpolation || 'monotone';

    let xScale = d3.scale.ordinal()
      .domain(data.xValues)
      .rangePoints([0, width]);

    let yScale = d3.scale[yScaleType]()
      .range([height, 10])
      .domain([data.yMin, data.yMax]);

    return (
      <svg width={width} height={height}>
        <DataSeries
          xScale={xScale}
          yScale={yScale}
          data={data}
          interpolationType={interpolation}
          colors={colors}
          width={width}
          height={height}
          />
      </svg>
    );
  }

});

module.exports = LineChart;
