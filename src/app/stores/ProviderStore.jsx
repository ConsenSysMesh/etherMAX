import lf from 'localforage';
import React   from 'react/addons';
import Reflux  from 'reflux';
import ProviderActions from '../actions/ProviderActions.jsx';
import StateMixinFactory from 'reflux-state-mixin';
import _ from 'lodash';
import web3 from 'web3';

lf.config({
    driver      : lf.WEBSQL, // Force WebSQL; same as using setDriver()
    name        : 'web3Store',
    version     : 1.0,
    size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName   : 'transactionStore', // Should be alphanumeric, with underscores.
    description : 'keep track of txHashes per-account'
});

export default Reflux.createStore({
  // How many blocks to wait until txs aren't checked
  mixins: [StateMixinFactory(Reflux)],
  listenables: [ProviderActions],

  poll: null,

  init() {
    this.connect();
  },

  getInitialState() {
    return {
      provider: 'http://localhost:8545',
      listening: false
    };
  },

  // Update a "listening" variable that can be used to prompt a login
  pollConnection() {
    var pollPeriod = 30000;
    if (!this.poll) {
      this.poll = setInterval(function() {
        this.checkConnection();
      }.bind(this), pollPeriod);
    }
  },

  clearPoll() {
    clearInterval(this.poll);
  },

  checkConnection() {
    this.setState({listening: web3.isConnected()});
  },

  setConnection() {
    web3.setProvider(new web3.providers.HttpProvider(this.state.provider));
    this.checkConnection();
  },

  // Load transactions and pending hashes
  loadStorage(cb) {
    var storedKeys = ['provider'];
    var promises = storedKeys.map(function(k) { return lf.getItem(k); });
    var defaults = storedKeys.map(function(k) { return this.getInitialState()[k]; }.bind(this));

    Promise.all(promises).then(function(res) {
      var newState = {};
      res.forEach(function(v, i) {
        newState[storedKeys[i]] = v ? JSON.parse(v) : defaults[i];
      });
      this.setState(newState);
      cb();
    }.bind(this));
  },

  save(key, val) {
    lf.setItem(key, JSON.stringify(val), function(err, v) {
      if (err) throw err;
    });
  },

  connect() {
    this.loadStorage(function() {
      this.setConnection();
    }.bind(this));

  },

  onSaveConnection(provider) {
    this.setState({provider: provider});
    this.save('provider', provider);
    this.setConnection();
  },

  onConnect() {
    this.connect();
  }
});
