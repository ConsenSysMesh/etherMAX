import "StandardToken";

contract Contest {
  event Enter(address indexed owner, uint indexed contestId, uint entryId);

  struct Entry {
    address owner;
    uint itemCount;
    uint itemPrice;
  }

  struct Solution {
    address owner;
    uint32 created;
    uint contestId;
    uint value;
    uint itemCount;

    uint provedValue;
    uint prevWinner;
    uint[] winners;
    bool didFail;
  }

  struct Contest {
    address owner;
    address token;

    uint blockNumber;
    uint32 created;
    uint32 entryPeriod;
    uint minPrice;
    uint maxItems;

    uint32 solvePeriod;
    uint32 claimPeriod;

    uint solverBond;

    uint solution;

    // Fee percentage
    uint32 reward;

    uint entryFees;

    Entry[] entries;
    Solution[] solutions;
    mapping (address => bool) isBonded;
  }

  function newContest(uint32 entryPeriod, uint minPrice, uint maxItems, uint32 solvePeriod, uint solverBond, uint32 reward) {
    Contest c = contests[contestCount++];
    c.owner = msg.sender;
    c.created = uint32(block.timestamp);
    c.blockNumber = block.number;
    c.entryPeriod = entryPeriod;
    c.minPrice = minPrice;
    c.maxItems = maxItems;
    c.solvePeriod = solvePeriod;
    c.solverBond = solverBond;
    c.reward = reward;
  }

  // Make a new offer for purchase
  function enter(uint contestId, uint itemCount, uint itemPrice) {
    if (contestId > contestCount)
      return;

    Contest c = contests[contestId];
    // Make sure window is open 
    if (uint32(block.timestamp) > (c.created + c.entryPeriod))
      return;

    // Charge an additional fee to compensate the correct solver...
    uint entryFee = solveEntryGas * tx.gasprice;

    // If not enough money, refund 
   if (
      (msg.value < itemCount * itemPrice + entryFee) ||
      (itemPrice < c.minPrice) ||
      (itemCount > c.maxItems)
      ) {
      msg.sender.send(msg.value);
      return;
    }

    // Add entry fees to pot
    c.entryFees += entryFee;

    uint index = c.entries.length++;

    Entry e = c.entries[index];

    e.owner = msg.sender;
    e.itemCount = itemCount;
    e.itemPrice = itemPrice;
    Enter(msg.sender, contestId, index);
  }

  function proposeSolve(uint contestId, uint value) {
    if (contestId > contestCount)
      return;

    Contest c = contests[contestId];
    // Make sure window is open 
    if (uint32(block.timestamp) > (c.created + c.entryPeriod+ c.solvePeriod))
      return;

    if (!c.isBonded[msg.sender])
      if (msg.value >= c.solverBond)
        c.isBonded[msg.sender] = true;
    if (!c.isBonded[msg.sender])
      return;

    Solution s = c.solutions[c.solutions.length++];
    s.owner = msg.sender;
    s.created = uint32(block.timestamp);
    s.contestId = contestId;
    s.value = value;
  }

  function claimBond(uint contestId) {
    if (contestId > contestCount)
      return;
    Contest c = contests[contestId];
    if (c.solution == 0)
      return;
    if (block.timestamp < c.created + (c.solutions.length * c.claimPeriod) + c.entryPeriod + c.solvePeriod)
      return;

    if (c.isBonded[msg.sender])
      msg.sender.send(c.solverBond);

    c.isBonded[msg.sender] = false;
  }
  
  function withdraw(uint contestId, uint entryId) {
    if (contestId > contestCount)
      return;

    Contest c = contests[contestId];
    Entry e = c.entries[entryId];
    if (e.owner != msg.sender)
      return;

    if (c.solution == 0 || block.timestamp < c.created + (c.solutions.length * c.claimPeriod) + c.entryPeriod + c.solvePeriod)
      msg.sender.send(e.itemCount * e.itemPrice);
  }

  // method for claiming the best solution, can be called mutliple times
//  function claimSolve(uint contestId, uint solutionId, bool last, uint[] winners) {
  function claimSolve(uint[] winners, uint contestId, uint solutionId, bool last) {
    if (contestId > contestCount)
      return;

    Contest c = contests[contestId];

    // Quit if already solved
    if (c.solution > 0) 
      return;

    if (solutionId < c.solutions.length)
      return;

    Solution ms = c.solutions[solutionId];
    if (ms.owner != msg.sender) return;

    // Verify that the solution interval is 
    uint32 solutionInterval = (uint32(block.timestamp) - (c.created + c.entryPeriod + c.solvePeriod)) / claimPeriod;

    uint index;
    uint betterSolutions = 0;
    bool mineSeen = false;
    Solution s;

    // validate the solution sender (todo: index this)
    for (index = 0; index < c.solutions.length; index++) {
      if (index == solutionId) {
        mineSeen = true;
        continue;
      }

      s = c.solutions[index];
      if (s.value > ms.value)
        betterSolutions++;

      if (s.value == ms.value && !mineSeen)
        betterSolutions++;
    }

    if (solutionInterval == betterSolutions) {
      //uint currentWinner;
      uint prevWinner = s.prevWinner;
      uint provedValue = s.provedValue;
      uint itemCount = s.itemCount;

      Entry e;
      // Append the winners to the 

      for (index = 0; index < winners.length; index++) {
        betterSolutions = winners[index];
        if (betterSolutions < prevWinner)
          s.didFail = true;

        e = c.entries[betterSolutions];
        provedValue += e.itemCount * e.itemPrice;
        itemCount += e.itemCount;

        prevWinner = betterSolutions;
        s.winners[s.winners.length++] = betterSolutions;
      }

      s.provedValue = provedValue;
      s.prevWinner = prevWinner;
    }

    if (!s.didFail && last && s.provedValue == s.value && s.itemCount < c.maxItems) {
      msg.sender.send(c.solverBond + s.value * uint(c.reward) / denom + c.entryFees);
      c.solution = solutionId;
      c.token = address(new StandardToken(s.itemCount));
    }
  }

  // Pass in the index of the solution's array of winning entries that corresponds to your entry
  function claimItems(uint contestId, uint winnerId) {
    if (contestCount < contestId) return;
    Contest c = contests[contestId];
    if (c.solution == 0) return;

    Solution s = c.solutions[c.solution];
    Entry e = c.entries[s.winners[winnerId]];

    if (e.owner == msg.sender) {
      StandardToken(c.token).sendCoin(e.itemCount, msg.sender);
      e.itemCount = 0;
    }
  }

  uint constant denom = 2*32-1;
  uint constant solveEntryGas = 20000;
  uint32 constant claimPeriod = 60 * 60;

  mapping (uint => Contest) public contests;
  uint public contestCount;
}
