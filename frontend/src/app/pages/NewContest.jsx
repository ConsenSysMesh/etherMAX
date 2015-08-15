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
      //return eval(val) || val;
      return eval(val);
    }.bind(this));
    console.log('fieldVals', fieldVals);
    var params = fieldVals.push({from: web3.eth.coinbase, gas: 3000000, value: 100});
    var hash = this.contract.at(this.props.contractAddress).newContest.sendTransaction.apply(this, fieldVals);
    console.log('hash:)', hash);
  },
  render() {
    return (
        <div>
          {'Create contest'}
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
              {'tokens for sell'}
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
