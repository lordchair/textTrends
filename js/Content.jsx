const React = require('react');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const Category = require('./Category.jsx');

const Content = React.createClass({
  propTypes: {
    autocompleteTags: React.PropTypes.array,
    categories: React.PropTypes.array,
    onAddToCategory: React.PropTypes.func,
    onRemoveFromCategory: React.PropTypes.func,
    results: React.PropTypes.element,
    children: React.PropTypes.oneOfType([React.PropTypes.element, React.PropTypes.array])
  },

  getDefaultProps() {
    return {
      autocompleteTags: [],
      categories: []
    }
  },

  render() {
    if (!this.props.autocompleteTags || !this.props.autocompleteTags.length) {
      return (
        <div className='main_content'>
          {this.props.children}
        </div>
      );
    }
    const autocompleteString = this.props.autocompleteTags.join('" "');
    return (
      <div className="main_content">
        {this.props.results}
        <div className="section categories input">
          {this.props.categories.map((category, index) => {
            return (
              <Category
                zIndex={this.props.categories.length - index}
                onAddToCategory={(...args) => { this.props.onAddToCategory(category.id, ...args); }}
                onRemoveFromCategory={(...args) => { this.props.onRemoveFromCategory(category.id, ...args); }}
                category={category}
                optionString={autocompleteString}
                />
            );
          })}
          <div className="add_category" onClick={() => { this.props.onAddToCategory(false, false); }}>+ Word group</div>
        </div>

        {/* <input type="number" className="number_input" id="chunk_number_input" defaultValue="10" max="1000" min="1" placeholder="Chunks/File"/> */}
        {this.props.children}
      </div>
    );
  }
});

module.exports = Content;
