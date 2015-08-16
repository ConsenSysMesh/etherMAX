// Modules
import React  from 'react/addons';
import web3   from 'web3';
import Router from 'react-router-component';
import Reflux from 'reflux';

import ContestPage from './pages/ContestPage.jsx';
import HomePage from './pages/HomePage.jsx';
import EntryPage from './pages/EntryPage.jsx';
import WinnerPage from './pages/WinnerPage.jsx';
import EntriesPage from './pages/EntriesPage.jsx';

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
          <Location path='/:contractAddress/:contestId' handler={ EntryPage } />
          <Location path='/:contractAddress/:contestId/winners' handler={ WinnerPage } />
          <Location path='/:contractAddress/entries' handler={ WinnerPage } />
        </Locations>
      </div>
        );
  }
});
