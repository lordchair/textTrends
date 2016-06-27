var React = require('react');
module.exports = React.createClass({
  propTypes: {
    onFilePreset: React.PropTypes.func,
    onFileUploaded: React.PropTypes.func,
    fileNames: React.PropTypes.array
  },
  render() {
    let fileList = null;
    if (this.props.fileNames && this.props.fileNames.length) {
      fileList = (
        <ul className="files_container">
          <div className="files-li-header">Files:</div>
          {this.props.fileNames.map((fileName) => {
            return (<li className='file-li' key={fileName}>{fileName}</li>);
          })}
        </ul>
      );
    }
    return (
      <div className="sidebar_content">
        <div className="section files">
          <div className="file_button_holder">
            Upload Files
            <input className="file_input" type="file" id="file_input" multiple="multiple" onChange={this.props.onFileUploaded}/>
          </div>
          <div className="file_button_holder external_file asoif" onClick={() => {this.props.onFilePreset('asoif')}} id="asoif">
            ASoIF
          </div>
          <div className="file_button_holder external_file lotr" onClick={() => {this.props.onFilePreset('lotr')}} id="lotr">
            LotR
          </div>
          <div className="file_selector"></div>
          {fileList}
        </div>
      </div>
    );
  }
});
