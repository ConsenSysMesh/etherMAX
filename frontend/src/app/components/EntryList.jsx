import React  from 'react/addons';
import web3   from 'web3';
import { TXActions } from 'reflux-tx';
import EntryActions from '../actions/EntryActions.jsx';
import Contracts from '../../Contracts.jsx';
import Router from 'react-router-component';

var Link = Router.Link;

export default React.createClass({
  contract: Contracts.Contest,

  componentWillReceiveProps(nextProps) {
    if (this.props.pending.length !== nextProps.pending.length) {
      EntryActions.load(this.props.contractAddress, this.props.contestId, this.props.options);
    }
  },

  render() {

    var pending = this.props.pending.map(function(tx) {
      return (
          <li style={{'padding-top': '10px'}}>
            <div>
              <pre>
                {JSON.stringify(tx.info.tempObject, null, 4)}
              </pre>
            </div>
          </li>
          );
    });

    var list = this.props.entries.filter(function(entry) {
      return entry !== null;
    }).map(function(entry, index) {
      return (
        <li style={{'padding-top': '10px'}}>
          <div>
            <pre>
              {JSON.stringify(entry, null, 4)}
            </pre>
          </div>
        </li>
      );
    });

    var header = this.props.pending.length ? <h3>pending entries</h3> : <div />;
    return (
      <div>
        {header} 
        <ul>
          {pending}
        </ul>
        <h3>entries</h3>
        <ul>
          {list}
        </ul>
      </div>
      );
  }
});
