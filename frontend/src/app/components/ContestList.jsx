import React  from 'react/addons';
import web3   from 'web3';
import { TXActions } from 'reflux-tx';
import ContestActions from '../actions/ContestActions.jsx';
import Contracts from '../../Contracts.jsx';
import Router from 'react-router-component';

var Link = Router.Link;

export default React.createClass({
  contract: Contracts.Contest,

  componentWillReceiveProps(nextProps) {
    console.log('nextprops', nextProps.pending.length);
    if (this.props.pending.length !== nextProps.pending.length) {
      console.log('reloading');
      ContestActions.load(this.props.contractAddress, this.props.options);
    }
  },

  render() {
    //{'is open: ' + new Date().getTime() / 1000 - contest.created - contest.entryPeriod < 0 }
    var pendList = this.props.pending.map(function(tx) {
      return (
          <li style={{'padding-top': '10px'}}>

            <div>
              <Link style={{'pointer-events': 'none', 'cursor': 'default', 'background': 'white'}} className='button' href={'/' + this.props.contractAddress}>
                <span style={{'margin-right': '30px'}}>
                { 'pending' }
                </span>
                {'owner: ' + tx.data.from}
              </Link>
            </div>
          </li>
          );
    }.bind(this));
    
    var list = this.props.contests.filter(function(contest) {
      return contest !== null;
    }).map(function(contest, index) {
      console.log('contest', contest, index);
      return (
          <li style={{'padding-top': '10px'}}>
            <div>
              <Link className='button' href={'/' + this.props.contractAddress + '/' + index}>
                <span style={{'margin-right': '30px'}}>
                { (new Date().getTime() / 1000 - contest.created - contest.entryPeriod < 0) ? 'active  ' : 'inactive'}
                </span>
                {'owner: ' + contest.owner}
              </Link>
            </div>
          </li>
          );
    }.bind(this));
    return (
        <div>
          <ul>
            {pendList}
            {list}
          </ul>
        </div>
        );
  }
});
