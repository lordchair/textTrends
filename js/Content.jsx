const React = require('react');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const Category = require('./Category.jsx');
const Instructions = require('./Instructions.jsx');

const Content = React.createClass({
  propTypes: {
    autocompleteTags: React.PropTypes.array,
    categories: React.PropTypes.array,
    onAddToCategory: React.PropTypes.func,
    onRemoveFromCategory: React.PropTypes.func,
    children: React.PropTypes.element
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
          <Instructions/>
        </div>
      );
    }
    const autocompleteString = this.props.autocompleteTags.join('" "');
    return (
      <div className="main_content">
        {this.props.children}
        <div className="section categories input">
          {this.props.categories.map((category, index) => {
            return (
              <Category
                onAddToCategory={(...args) => { this.props.onAddToCategory(category.id, ...args); }}
                onRemoveFromCategory={(...args) => { this.props.onRemoveFromCategory(category.id, ...args); }}
                category={category}
                optionString={autocompleteString}
                />
            );
          })}
          <div className="add_category" onClick={() => { this.props.onAddToCategory(false, false); }}><div className='plus'>+</div><br/>Word group</div>
        </div>

        {/* <input type="number" className="number_input" id="chunk_number_input" defaultValue="10" max="1000" min="1" placeholder="Chunks/File"/> */}
        <Instructions/>
      </div>
    );
  }
});

module.exports = Content;
