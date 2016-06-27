var React = require('react');
const Spinner = React.createClass({
  propTypes: {
    total: React.PropTypes.number,
    remaining: React.PropTypes.number
  },
  onClick(e) {
    e.stopPropagation();
  },
  render() {
    if (this.props.total && this.props.remaining > 0) {
      return (
        <div onClick={this.onClick} className="loading_overlay">
          <div className="spinner">
            <div className="rect1"></div>
            <div className="rect2"></div>
            <div className="rect3"></div>
            <div className="rect4"></div>
            <div className="rect5"></div>
          </div>
          <div className="progress">
            {`Processing file ${this.props.total - this.props.remaining} / ${this.props.total}`}
          </div>
        </div>
      );
    }
    return null;
  }
});

module.exports = Spinner;