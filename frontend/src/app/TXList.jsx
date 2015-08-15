import React  from 'react/addons';

var mapping = {
  pending: [
    'info',
    'data'
  ],
  unconfirmed: [
    'info',
    'data',
    'receipt'
  ]
};

export default React.createClass({
  getDefaultProps() {
    return {
      pending: [],
      unconfirmed: [],
      blockNumber: 0
    };
  },
  genListElement(tx) {
    var element = [];

    element.push(<div><b><pre>{'\n' + tx.info.hash}</pre></b></div>);
    for (let key in tx) {
      if (!tx.hasOwnProperty(key))
        continue;
      element.push(
          <div>
            <h4>{key}</h4>
            <div>
              <pre>{JSON.stringify(tx[key], null, 2)}</pre>
            </div>
          </div>
          );
    }
    element.push(<div><pre>{'\n\n\n'}</pre></div>);
    return element;
  },
  render() {
    var pendingEls = this.props.pending.map(this.genListElement);
    var unconfirmedEls = this.props.unconfirmed.map(this.genListElement);
    return (
        <div>
          <div>
            <h3>Current block: {this.props.blockNumber}</h3>
          </div>
          <h3>Transactions Pending</h3>
          {pendingEls}
          <h3>Unconfirmed Transactions</h3>
          {unconfirmedEls}
        </div>
        );
  }
});
