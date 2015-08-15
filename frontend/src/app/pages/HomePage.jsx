
// Modules
import React  from 'react/addons';
import web3   from 'web3';
import Router from 'react-router-component';
import StateMixinFactory from 'reflux-state-mixin';
import Reflux from 'reflux';

import ProviderStore from '../stores/ProviderStore.jsx';
import ProviderActions from '../actions/ProviderActions.jsx';


// Router Components
var Link = Router.Link;

export default React.createClass({
  mixins: [StateMixinFactory(Reflux).connect(ProviderStore)],
  getInitialState() {
    return {
      contractAddress: '0x'
    };
  },
  setContract(e) {
    console.log('contractAddress', e.target.value);
    this.setState({contractAddress: e.target.value});
  },
  updateProvider(e) {
    console.log('provider', e.target.value);
    this.setState({provider: e.target.value});
  },
  setProvider() {
    ProviderActions.saveConnection(this.state.provider);
  },
  render() {
    if (this.state.listening)
      return (
        <div>
          <div>
            <h3>Enter the contest factory address</h3>
            <input onChange={this.setContract}></input>
            <Link className='button' href={'/' + this.state.contractAddress}>Enter</Link>
          </div>
        </div>
      );
    else
      return (
        <div>
          Enter web3 provider:
          <input value={this.state.provider} onChange={this.updateProvider}></input>
          <button onClick={this.setProvider}>Submit</button>
          
          <div>
            {this.state.connectionResult}
          </div>
        </div>
          );
  }
});
