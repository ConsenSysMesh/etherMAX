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
  getInputForm() {
    var contest = this.state.contest;

    if (!contest) return <div />;

    var enterable = new Date().getTime() / 1000 - contest.created < contest.entryPeriod;

    if (!enterable)
      return <div />;
    else
      return (
          <div>
            <div>
              {'How many tokens to purchase (max: ' + this.state.contest.maxItems + ')'}
              <div>
                <input ref={'itemCount'} value={this.state.itemCount} onChange={this.update}/>
              </div>
            </div>
            <div>
              {'Price per token (min: ' + this.state.contest.minPrice + ')'}
              <div>
                <input ref={'itemPrice'} value={this.state.itemPrice} onChange={this.update}/>
              </div>
            </div>
            <div>
              {'+ ' + web3.fromWei(web3.eth.gasPrice * 20000 * 1.1, 'ether') + ' ETH fee for gas compensation' }
            </div>
            <button onClick={this.submit}>Submit entry</button>
          </div>
        );
  },
  render() {

    return (
        <div>
          {this.getInputForm()}
          <div>
            <TXComponent filter={{address: this.props.contractAddress, contest: this.props.contestId}}>
              <EntryList {...this.props} {...this.state} />
            </TXComponent>
          </div>
        </div>
        );
  }
});
