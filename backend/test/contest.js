contract("Contest", function(accounts) {
  console.log('contract', arguments);
  var contract;

  before(function() {
    contract = Contest.at(Contest.deployed_address);
  });

  it('init contest', function(done) {
    var reward = web3.toBigNumber(2).pow(32).div(100).floor();       // 1% fee
    console.log('reward', reward.toString());
    contract.newContest.sendTransaction(45*60, 0, 10000, 2*24*60, web3.toWei(100, 'ether'), reward, {gas: 3000000, from: accounts[0]}).then(function() {
      Promise.all([
          contract.contestCount.call(),
          contract.contests.call(0)
      ]).then(function(res) {
        assert.equal(res[0].toString(), 1);
        done();
      });
    });
  });

});
