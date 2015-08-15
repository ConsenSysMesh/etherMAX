import React   from 'react/addons';
import Reflux  from 'reflux';
import ContestActions from '../actions/ContestActions.jsx';
import StateMixinFactory from 'reflux-state-mixin';
import _ from 'lodash';
import web3 from 'web3';

export default Reflux.createStore({
  // How many blocks to wait until txs aren't checked
  mixins: [StateMixinFactory(Reflux)],
  listenables: [ContestActions],

  init() {
    this.onLoad();
  },

  getInitialState() {
    return {
      contests: []
    };
  },

  onLoad(payload) {
    var options = _.assign({'page': 1, 'count': 20, 'skip': 0}, payload);
    // load contract.contests[page-1+skip*count: math.min(count, entryCount)] from here
  }
});
