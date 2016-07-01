const React = require('react');
const tinycolor = require('tinycolor2');

const Typeahead = React.createClass({
  propTypes: {
    optionString: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func
  },

  getInitialState() {
    return {
      suggestions: [],
      cursorIndex: 0,
      focus: false
    }
  },

  checkString(e) {
    const toCheck = e.target.value;
    if (!toCheck) {
      this.setState({ suggestions: [] });
    } else {
      setTimeout(() => {
        this.setState({
          suggestions: this.regexMatch(toCheck)
        });
      }, 0);
    }
  },

  regexMatch(toCheck) {
    const reStr = '"([^"]*' + toCheck + '[^"]*)"';
    const re = new RegExp(reStr, 'gi');

    let suggestions = [];
    let i = 0;
    let result;
    while (result = re.exec(this.props.optionString)) {
      if (result[1].indexOf('"') !== -1) { continue; }
      suggestions.push(result[1]);
      i += 1;
      if (i >=100) {
        break;
      }
    }

    const toCheckIndex = suggestions.indexOf(toCheck);
    if (toCheckIndex > 0) {
      suggestions = [suggestions[toCheckIndex], ...suggestions.slice(0, toCheckIndex), ...suggestions.slice(toCheckIndex + 1)];
    }

    return suggestions;
  },

  onKeyUp(e) {
    const key = e.key;
    if (!key) { return; }
    switch(key.toLowerCase()) {
      case 'enter':
        this.selectOption(e.target.value);
        break;
      case 'tab':
        this.selectOption(e.target.value);
        break;
      case 'escape':
        this._textInput.blur();
        break;
      default: return;
    }
  },

  selectOption(selectedStr) {
    if (selectedStr.indexOf('color:') === 0) {
      const color = tinycolor(selectedStr.slice(7));
      color.setAlpha(.4);
      this.props.onOptionSelected(color.toRgbString(), 'color');
    } else if (this.state.suggestions.indexOf(selectedStr) >= 0) {
      this.props.onOptionSelected(selectedStr);
    } else {
      this.props.onOptionSelected(this.state.suggestions[this.state.cursorIndex]);
    }
    this._textInput.value = '';
    this.setState({ suggestions: [] });
  },

  render() {
    let suggestions = null;
    if (this.state.focused) {
      suggestions = (
        <div className='typeahead_suggestions'>
          {this.state.suggestions.map((suggestion) => {
            return (
              <div className='typeahead_suggestion' onMouseDown={() => { this.selectOption(suggestion) }}>{suggestion}</div>
            );
          })}
        </div>
      );
    }
    return (
      <div className='Typeahead'>
        <input type='string'
          className='typeahead'
          onKeyUp={this.onKeyUp}
          onFocus={() => { this.setState({ focused: true })}}
          onBlur={() => { this.setState({ focused: false })}}
          onChange={this.checkString}
          ref={component => this._textInput = component}
          placeholder='enter regex/string'/>
        {suggestions}
      </div>
    );
  }

})

module.exports = Typeahead;
