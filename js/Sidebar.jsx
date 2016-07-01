const React = require('react');
const Dropdown = require('./Dropdown.jsx');

const Sidebar = React.createClass({
  propTypes: {
    updateChunkNumber: React.PropTypes.func,
    updateGraphOption: React.PropTypes.func,
    onFilePreset: React.PropTypes.func,
    onFileUploaded: React.PropTypes.func,
    numChunks: React.PropTypes.number,
    fileNames: React.PropTypes.array,
    selectedGraphOptions: React.PropTypes.object
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
    let maybeDetailedChartOptions = null;
    if (!this.props.selectedGraphOptions || !this.props.selectedGraphOptions.useOldGraph) {
      maybeDetailedChartOptions = [
        (<Dropdown title='Y Axis Type' options={['linear', 'log', 'pow', 'sqrt']} selected={this.props.selectedGraphOptions.yScaleType} onOptionSelected={(sel) => this.props.updateGraphOption('yScaleType', sel)}/>),
        (<Dropdown title='Graph Interpolation' options={['monotone', 'linear', 'basis', 'cardinal', 'bundle']} selected={this.props.selectedGraphOptions.interpolation} onOptionSelected={(sel) => this.props.updateGraphOption('interpolation', sel)}/>)
      ];
    }
    return (
      <div className="section files">
        <div className="file_inputs">
          <div className="file_button_holder">
            Upload Files
            <input className="file_input" type="file" id="file_input" multiple="multiple" onChange={this.props.onFileUploaded}/>
          </div>
          <div className="file_button_holder external_file asoif" onClick={() => {this.props.onFilePreset('asoif')}} id="asoif">
            ASoIaF
          </div>
          <div className="file_button_holder external_file lotr" onClick={() => {this.props.onFilePreset('lotr')}} id="lotr">
            LotR
          </div>
        </div>
        <div className='num_chunks_input'>
          How many sections per file?<br/>
          (too many leads to noisy results)<br/>
          <input type='number' onChange={(event) => this.props.updateChunkNumber(event.target.value)} value={this.props.numChunks} />
        </div>
        <div className='graph_options'>
          Graph Options:
          <label><input type='checkbox' value='true' onChange={() => this.props.updateGraphOption('useOldGraph', !this.props.selectedGraphOptions.useOldGraph)} />Use chart lib</label>
          {maybeDetailedChartOptions}
        </div>
        {fileList}
      </div>
    );
  }
});

module.exports = Sidebar;
