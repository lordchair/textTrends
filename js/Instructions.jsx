var React = require('react');

const Instructions = React.createClass({
  render() {
    return (
      <ul className="section instructions">
        <li className="instruct">Get some data up in here. Use the sidebar on the left and upload your own plain .txt files or select the text of a book series (currently Lord of the Rings or Game of Thrones)</li>
        <li className="instruct">Wait for the initial analysis</li>
        <li className="instruct">Add a new category with the big button</li>
        <li className="instruct">Select a word or multiple to chart</li>
        <li className="instruct">Maybe add some other categories to compare?</li>
        <li className="instruct">"Analyze" up in the top left</li>
        <li className="instruct">???</li>
        <li className="instruct">Profit</li>
      </ul>
    );
  }
});

module.exports = Instructions;
