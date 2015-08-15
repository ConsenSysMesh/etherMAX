import React  from 'react/addons';
import web3   from 'web3';
import { TXComponent } from 'reflux-tx';
import EntryPage from './EntryPage.jsx';
//import ContestStore from '../stores/ContestStore.jsx';
//import ContestActions from '../stores/ContestActions.jsx';
import Router from 'react-router-component';

var Locations = Router.Locations;

export default React.createClass({
  getInitialState() {
    return {
    };
  },
  render() {
    return (
        <div>
          <Locations>
            <Locations path='/:contestId' handler={ EntryPage } />
          </Locations>
          <div>
            {'Contest page'}
          </div>
        </div>
        );
  }
});
