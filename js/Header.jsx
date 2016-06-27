const React = require('react');

const Header = React.createClass({
  propTypes: {
    showContactInfo: React.PropTypes.bool,
    onAnalyzeClicked: React.PropTypes.func,
    onResetClicked: React.PropTypes.func
  },

  render() {
    const contactInfo = this.props.showContactInfo ? (
      <div className="contact_info">
        <div className="number"><a href="http://yale-thomas.com">yale-thomas.com</a></div>
        <a href="mailto:lordchair+site_texttrends@gmail.com?Subject=TextTrends Response" target="_top">
          lordchair@gmail.com
        </a>
      </div>
    ) : null;

    return (
      <div className="header">
        {contactInfo}
        <div className="master_panel">
            <div className="activate button" onClick={this.props.onAnalyzeClicked}><a href="#science">Analyze</a></div><br/>
          <div className="reset button" onClick={this.props.onResetClicked}><a href="">Reset All</a></div>
        </div>
        <div className="name_div">
          Text Trends Analyzer
        </div>
      </div>
    );
  }
})

module.exports = Header;
