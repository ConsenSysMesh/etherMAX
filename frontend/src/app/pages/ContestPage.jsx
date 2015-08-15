import React  from 'react/addons';
import Reflux from 'reflux';
import web3   from 'web3';
import { TXComponent } from 'reflux-tx';
import EntryPage from './EntryPage.jsx';
import StateMixinFactory from 'reflux-state-mixin';
import ContestStore from '../stores/ContestStore.jsx';
import ContestActions from '../actions/ContestActions.jsx';
import ContestList from '../components/ContestList.jsx';
import NewContest from './NewContest.jsx';
import Router from 'react-router-component';
import Contracts from '../../Contracts.jsx';

var Locations = Router.Locations;

export default React.createClass({
  mixins: [StateMixinFactory(Reflux).connect(ContestStore)],
  componentDidMount() {
    ContestActions.load(this.props.contractAddress);
  },
  render() {
    //<TXComponent filter={}> <ContestList contests={this.state.contests} />
    return (
        <div>
          <Locations>
            <Locations path='/:contestId' handler={ EntryPage } />
          </Locations>
          <div>
            {'Contest page'}
          </div>
          <NewContest {...this.props} />
          <div>
            <h3>Contests</h3>
            <pre>
            {JSON.stringify(this.state, null, 4)}
            </pre>
          </div>
        </div>
        );
  }
});
