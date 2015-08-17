import React  from 'react/addons';
import Reflux from 'reflux';
import web3   from 'web3';
import { TXComponent } from 'reflux-tx';
import StateMixinFactory from 'reflux-state-mixin';
import ContestStore from '../stores/ContestStore.jsx';
import ContestActions from '../actions/ContestActions.jsx';
import ContestList from '../components/ContestList.jsx';
import NewContest from './NewContest.jsx';
import Contracts from '../../Contracts.jsx';

export default React.createClass({
  mixins: [StateMixinFactory(Reflux).connect(ContestStore)],
  componentDidMount() {
    ContestActions.load(this.props.contractAddress);
  },
  render() {
    //<TXComponent filter={}> <ContestList contests={this.state.contests} />
    return (
        <div>
          <NewContest {...this.props} />
          <div>
            <h3>Contests</h3>
            <TXComponent filter={{address: this.props.contractAddress}}>
              <ContestList {...this.props} {...this.state} />
            </TXComponent>
          </div>
        </div>
        );
  }
});
