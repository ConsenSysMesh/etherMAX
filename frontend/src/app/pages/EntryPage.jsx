import React  from 'react/addons';
import web3   from 'web3';
import Reflux  from 'reflux';
import StateMixinFactory from 'reflux-state-mixin';
import { TXActions, TXComponent } from 'reflux-tx';
import EntryStore from '../stores/EntryStore.jsx';
import EntryActions from '../actions/EntryActions.jsx';
import EntryList from '../components/EntryList.jsx';

import ContestStore from '../stores/ContestStore.jsx';
import Contracts from '../../Contracts.jsx';

import Router from 'react-router-component';

export default React.createClass({
  mixins: [
    StateMixinFactory(Reflux).connect(EntryStore)
  ],
  contract: web3.eth.contract(Contracts.Contest.abi),
  getInitialState() {
    var cs = ContestStore.state;
    var index = cs.contests.length - 1 - parseInt(this.props.contestId) + (parseInt(cs.options.page) - 1) * parseInt(cs.options.count);

    return {
      itemPrice: cs.contests[index].minPrice,
      itemCount: 1,
      contest: cs.contests[index]
    };
  },
  componentDidMount() {
    EntryActions.load(this.props.contractAddress, this.props.contestId);
  },
  submit() {
    var price = this.refs.itemPrice.getDOMNode().value;
    var count = this.refs.itemCount.getDOMNode().value;
    var balance = web3.eth.getBalance(web3.eth.coinbase);
    var fee = web3.eth.gasPrice * 20000 * 1.1;

    if (this.state.contest.minPrice > this.refs.itemPrice || balance < price * count + fee)
      return;

    var hash = this.contract.at(this.props.contractAddress).enter(this.props.contestId, count, price, {
      gas: 3000000,
      from: web3.eth.coinbase,
      value: price * count + fee
    });
    TXActions.add({hash: hash, address: this.props.contractAddress, contest: this.props.contestId, tempObject: {
      owner: web3.eth.coinbase,
      itemCount: count,
      itemPrice: price
    }});
  },
  update() {
    var price = this.refs.itemPrice.getDOMNode().value;
    var count = this.refs.itemCount.getDOMNode().value;

    this.setState({
      itemPrice: price,
      itemCount: count
    });
  },
  getContestState(contest) {
    var curTime = new Date().getTime() / 1000;

    // curTime - contest.created > contest.entryPeriod
    return contest.created;

  },
  getState() {
    var contest = this.state.contest;
    var curTime = new Date().getTime() / 1000;

    if (!contest) return <div />;
    var created = parseInt(contest.created);
    var entryPeriod = parseInt(contest.entryPeriod);
    var solvePeriod = parseInt(contest.solvePeriod);
    var claimPeriod = parseInt(contest.claimPeriod);

    var enterable = curTime - created < entryPeriod;

    var solvable = !enterable && curTime - created < entryPeriod + solvePeriod;

    var solved = this.state.contest.solution > 0;
    var claimingPeriod = !enterable && !solvable && curTime - created < entryPeriod + solvePeriod + claimPeriod * this.state.entries.length;
    //var unsolved = curTime - created > entryPeriod + solvePeriod + claimPeriod * this.state.contest.solutions.length;
    var remainingSeconds = 0;

    /*
    if (unsolved) {
      return (
          <div>
            {'no valid solution was provided :('}
          </div>
          );
    } else 
    */
    if (solved) {
      return (
          <div>
            {'a packing solution has been found, see if you won: <>'}
          </div>
          );
    } else if (solvable) {
      remainingSeconds = parseInt(contest.created) + parseInt(contest.entryPeriod) + parseInt(contest.solvePeriod) - curTime;
      return (
          <div>
            <div>
              {'waiting for solutions for the next '} 
              { Math.floor(remainingSeconds) + ' seconds' }
            </div>
          </div>
          );
    } else if (enterable) {
      remainingSeconds = parseInt(contest.created) + parseInt(contest.entryPeriod) - curTime;
      return (
          <div>
            <div>
              {'New entries allowed for the next ' + Math.floor(remainingSeconds) + ' seconds'}
            </div>
            <div>
              {'How many tokens to purchase '}
              <div>
                <input ref={'itemCount'} value={this.state.itemCount} onChange={this.update} />
              </div>
            </div>
            <div>
              {'Price per token '}
              <div>
                <input ref={'itemPrice'} value={this.state.itemPrice} onChange={this.update} />
              </div>
            </div>
            <div>
              {'+ ' + web3.fromWei(web3.eth.gasPrice * 20000 * 1.1, 'ether') + ' ETH fee for gas compensation' }
            </div>
            <button onClick={this.submit}>Submit entry</button>
          </div>
        );
    } else return <div />;
  },
  render() {

    return (
        <div>
          {this.getState()}
          <div>
            <TXComponent filter={{address: this.props.contractAddress, contest: this.props.contestId}}>
              <EntryList {...this.props} {...this.state} />
            </TXComponent>
          </div>
        </div>
        );
  }
});
