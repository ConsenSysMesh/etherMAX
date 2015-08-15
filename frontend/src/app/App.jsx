// Modules
import React  from 'react/addons';
import web3   from 'web3';
import Router from 'react-router-component';
import StateMixinFactory from 'reflux-state-mixin';
import Reflux from 'reflux';

import ContestPage from './pages/ContestPage.jsx';
import HomePage from './pages/HomePage.jsx';

// Router Components
var Locations = Router.Locations;
var Location = Router.Location;
var Link = Router.Link;

export default React.createClass({
  render() {
    return (
      <div>
        <Locations>
          <Location path='/' handler={ HomePage } />
          <Location path='/:contractAddress' handler={ ContestPage } />
        </Locations>
      </div>
        );
  }
});
