import React   from 'react/addons';
import Reflux  from 'reflux';
import EntryActions from '../actions/EntryActions.jsx';
import StateMixinFactory from 'reflux-state-mixin';
import _ from 'lodash';
import web3 from 'web3';
import Contracts from '../../Contracts.jsx';

export default Reflux.createStore({
  contract: web3.eth.contract(Contracts.Contest.abi),

  // How many blocks to wait until txs aren't checked
  mixins: [StateMixinFactory(Reflux)],
  listenables: [EntryActions],

  getInitialState() {
    return {
      options: {},
      entries: []
    };
  },

  fields: [
    'owner',
    'itemCount',
    'itemPrice'
  ],

  serializeEntry(entry) {
    return _.object(this.fields, entry.map(function(val) {
      return val.toString() || val;
    }));
  },

  onLoad(address, id, payload) {
    var options = _.assign({'page': 1, 'count': 20, 'skip': 0}, payload);
    this.setState({options: options});

    var batch = web3.createBatch();
    var contestContract = this.contract.at(address);

    function loadEntry(stateIndex, err, entry) {
      this.state.entries[stateIndex] = this.serializeEntry(entry);
      this.setState({entries: this.state.entries});
    }

    var startindex = (options.page - 1) * options.count + options.skip * options.count;

    var entryCount = contestContract.entryCount.call(id).toNumber() || 0;

    var count = Math.min(options.count, entryCount);

    this.setState({
      entries: _.range(0, count).map(function() { return null; })
    });

    for (var i = 0; i < count; i++) {
      batch.add(contestContract.entries.request(id, startindex + i, loadEntry.bind(this, count - i - 1)));
    }

    // load contract.entries[page-1+skip*count: math.min(count, entryCount)] from here
    batch.execute();
  }
});
