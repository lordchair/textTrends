const React = require('react');
const d3 = require('d3');
const Line = require('./Line.jsx');

const DataSeries = React.createClass({
  propTypes: {
    colors: React.PropTypes.array,
    data: React.PropTypes.object,
    interpolationType: React.PropTypes.string,
    xScale: React.PropTypes.func,
    yScale: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      data: [],
      interpolationType: 'cardinal',
      colors: d3.scale.category10()
    };
  },

  render() {
    let { data, colors, xScale, yScale, interpolationType } = this.props;

    let line = d3.svg.line()
      .interpolate(interpolationType)
      .x((d) => {
        return xScale(d.x)||0; })
      .y((d) => {
        return yScale(d.y)||0; });

    let lines = data.points.map((series, id) => {
      return (
        <Line
          path={line(series)}
          stroke={colors[id]}
          key={id}
          />
      );
    });

    return (
      <g>
        <g>{lines}</g>
      </g>
    );
  }
});

module.exports = DataSeries;
