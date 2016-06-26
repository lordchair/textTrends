const React = require('react');
const Typeahead = require('./Typeahead.jsx');
const tinycolor = require('tinycolor2');

const Category = React.createClass({
  propTypes: {
    category: React.PropTypes.object,
    optionString: React.PropTypes.string,
    onAddToCategory: React.PropTypes.func,
    onRemoveFromCategory: React.PropTypes.func
  },

  componentWillMount() {
    if (!this.props.category.color) {
      const gennedColor = tinycolor.random();
      gennedColor.setAlpha(.4);
      this.props.onAddToCategory(gennedColor.toRgbString(), 'color');
    }
  },


  render() {
    const categoryStyle = {
      backgroundColor: this.props.category.color
    }
    return (
      <div style={categoryStyle} className="category">
        <div className="top_row">
          <Typeahead
            optionString={this.props.optionString}
            onOptionSelected={this.props.onAddToCategory}
          />
          <div className="remove_category" onClick={() => { this.props.onRemoveFromCategory(); }}>X</div>
        </div>
        <div className="word_list">
          {this.props.category.words.map((word) => {
            return (
              <div onClick={() => { this.props.onRemoveFromCategory(word); }} className='selected_word'>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Category;