import React  from 'react/addons';
import web3   from 'web3';
import Reflux  from 'reflux';
import StateMixinFactory from 'reflux-state-mixin';
import { TXActions } from 'reflux-tx';
import EntryStore from '../stores/EntryStore.jsx';
import EntryActions from '../actions/EntryActions.jsx';
import Router from 'react-router-component';

export default React.createClass({
  mixins: [StateMixinFactory(Reflux).connect(EntryStore)],
  componentDidMount() {
    EntryActions.load();
  },
  render() {
    return (
        <div>
          {'Entries'}
        </div>
        );
  }
});
