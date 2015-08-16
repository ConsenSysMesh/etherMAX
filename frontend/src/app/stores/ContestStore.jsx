import React   from 'react/addons';
import Reflux  from 'reflux';
import ContestActions from '../actions/ContestActions.jsx';
import StateMixinFactory from 'reflux-state-mixin';
import Contracts from '../../Contracts.jsx';
import _ from 'lodash';
import web3 from 'web3';

export default Reflux.createStore({
  // How many blocks to wait until txs aren't checked
  mixins: [StateMixinFactory(Reflux)],
  listenables: [ContestActions],

  contract: web3.eth.contract(Contracts.Contest.abi),

  getInitialState() {
    return {
      options: {},
      contests: []
    };
  },

  fields: [
    'owner',
    'token',
    'blockNumber',
    'created',
    'entryPeriod',
    'minPrice',
    'maxItems',
    'solvePeriod',
    'claimPeriod',
    'solverBond;',
    'solution',
    'reward',
    'entryFees'
  ],

  serializeContest(c) {
    return _.object(this.fields, c.map(function(el) { return el.toString() || el; }));
  },

  onLoad(address, opts) {
    var options = _.assign({'page': 1, 'count': 20, 'skip': 0}, opts);
    this.setState({options: options});

    var batch = web3.createBatch();
    var contestContract = this.contract.at(address);

    function loadContest(index, err, contest) {
      if (err) return;
      var c = this.serializeContest(contest);
      this.state.contests[index] = c;
      this.setState({contests: this.state.contests});
    }

    var contestCount = contestContract.contestCount().toNumber() || 0;

    var startindex = (options.page - 1) * options.count + options.skip * options.count;
    var count = Math.min(options.count, contestCount);

    this.setState({
      contests: _.range(0, count).map(function() {return null; })
    });

    for (var i = 0; i < count; i++) {
      batch.add(contestContract.contests.request(startindex + i, loadContest.bind(this, count - i - 1)));
    }

    batch.execute();
  }
});
