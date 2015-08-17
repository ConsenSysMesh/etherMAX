## etherMAX

etherMAX is a contest built on Ethereum to incentivize solving an optimization problem. The app was built for a ConenSys Dapp-athon

On etherMAX, anyone can create their own token sale by describing 1) the max number of tokens available, 2) a minimum price per token, 3) length of sale 4) bond required for each matcher, 5) amount of time allotted to find optimal matches, and 6) a % reward to the best matcher

	

Contests are created with this method: 
`newContest(uint32 entryPeriod, uint minPrice, uint maxItems, uint32 solvePeriod, uint solverBond, uint32 reward)`



#### This creates a 4 phase contest:

`function enter(uint contestId, uint itemCount, uint itemPrice)`

- Entry phase: anyone can commit to purchase a number of tokens at any price. These pledges are non-revocable but funds can be claimed if they are not awarded the tokens

`function proposeSolve(uint contestId, uint maxEth)`

- Matching phase: anyone who has put down the bond required by the sale can submit an ETH value that is achievable via combination of the entries. Only the value is required

`function claimSolve(uint[] winners, uint contestId, uint solutionId, bool last)`

- Solution claiming phase: the highest value submitter has a period of time to 'prove' their solution by providing the indices of the entries that add up to that sum

`function claimItems(uint contestId, uint winnerId)`

- Token claiming phase: anyone who was matched in the previous phase will have access to a new token contract where they can send themselves the purchased amount


You can run a simple interface for creating contests & entries by running `cd frontend && npm start`

A very naiive knapsack solver can be run with `cd solver && npm install && node server <contractAddress> <contestId>`

