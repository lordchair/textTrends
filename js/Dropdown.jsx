const React = require('react');

const Dropdown = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    options: React.PropTypes.array,
    selected: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      options: [],
    };
  },

  onChange(e) {
    this.props.onOptionSelected(e.target.value);
  },

  render() {
    return (
      <select className='Dropdown' defaultValue={this.props.selected} onChange={this.onChange}>
        {this.props.options.map((option) => {
          return (
            <option key={option} value={option}>{option}</option>
          );
        })}
      </select>
    );
  }

})

module.exports = Dropdown;
