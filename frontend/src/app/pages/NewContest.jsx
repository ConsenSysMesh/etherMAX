import React  from 'react/addons';
import web3   from 'web3';
import _ from 'lodash';
import { TXActions } from 'reflux-tx';
import Router from 'react-router-component';
import Contracts from '../../Contracts.jsx';

export default React.createClass({
  contract: web3.eth.contract(Contracts.Contest.abi),
  fields: [
    'entryPeriod', 'maxItems', 'minPrice', 'reward', 'solvePeriod', 'solverBond'
  ],
  submitContest() {

    var fieldVals = this.fields.map(function(f) {
      var val = this.refs[f].getDOMNode().value;
      if (f === 'reward') {
        if (val < 0) val = 0;
        if (val > 1) val = 1;

        return web3.toBigNumber(2).pow(32).mul(Math.floor(val));
      } else return eval(val);
    }.bind(this));

    var params = fieldVals.push({from: web3.eth.coinbase, gas: 3000000, value: 100});
    var hash = this.contract.at(this.props.contractAddress).newContest.sendTransaction.apply(this, fieldVals);
    TXActions.add({hash: hash, address: this.props.contractAddress});
  },
  render() {
    return (
        <div>
          <h3>{'Create contest'}</h3>
          <div>
            <div>
              {'time allotted to make an offer'}
            </div>
            <input ref='entryPeriod'/>
          </div>
          <div>
            <div>
              {'min price to enter'}
            </div>
            <input ref='minPrice'/>
          </div>
          <div>
            <div>
              {'tokens for sale'}
            </div>
            <input ref='maxItems'/>
          </div>
          <div>
            <div>
              {'time allotted for finding solution'}
            </div>
            <input ref='solvePeriod'/>
          </div>
          <div>
            <div>
              {'bond required to be a solver'}
            </div>
            <input ref='solverBond'/>
          </div>
          <div>
            <div>
              {'reward for solving'}
            </div>
            <input ref='reward' />
          </div>
          <button onClick={this.submitContest}>Submit contest</button>
        </div>
        );
  }
});
