const React = require('react');

const Header = React.createClass({
  propTypes: {
    showContactInfo: React.PropTypes.bool
  },

  render() {
    const contactInfo = !this.props.showContactInfo ? (
      <div className="contact_info">
        <a href="http://lordchair.github.io/">
          Yale Thomas
        </a>
        <a href="https://github.com/lordchair/textTrends">
          github
        </a>
      </div>
    ) : null;

    return (
      <div className="header">
        {contactInfo}
        <div className="name_div">
          Text Trends Analyzer
        </div>
      </div>
    );
  }
})

module.exports = Header;
