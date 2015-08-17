var web3 = require('web3');
var contracts = require('../backend/config/development/contracts.json');
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var contestAddress = process.argv[2];
var contestId = process.argv[3];
var queryPhase = process.argv.length > 4;


if (!contestId || !contestAddress)  {
    console.log('USAGE:\tnode solver <contestAddress> <contestId>');
    process.exit(1);
}
console.log('Contract\t\t', contestAddress);
console.log('Contest ID:\t\t', contestId);

var contestContract = web3.eth.contract(contracts.Contest.abi).at(contestAddress);

var contest = contestContract.contests.call(contestId);
var entryCount = contestContract.entryCount.call(contestId).toNumber();
var created = contest[3].toNumber();
var entryPeriod = contest[4].toNumber();
var maxItems = contest[6].toNumber();
var solvePeriod = contest[7].toNumber();
var claimPeriod = contest[8].toNumber();
var solverBond = contest[9].toNumber();
var contest = {
    maxItems: maxItems,
    entries: []
};


var curTime = new Date().getTime() / 1000;
var phase;
if (curTime > created + entryPeriod && curTime < created + entryPeriod + solvePeriod)
    phase = 'solvable';

function loadEntries(cb) {
    console.log('loading contest entries...');
    for (var i = 0; i < entryCount; i++) {
        var entry = contestContract.entries.call(contestId, i);
        contest.entries.push({owner: entry[0], itemCount: entry[1].toNumber(), value: entry[1].toNumber() * entry[2].toNumber() });
    }
    cb();
}

function waitForTx(hash, cb) {
    var filter = web3.eth.filter('latest');
    filter.watch(function() {
    });
}

function solveContest(contest) {
    loadEntries(function() {
        console.log('looking for solutions...');
        //var combos = genCombos(contest.entries);
        var formattedEntries = contest.entries.map(function (e, index) {
            return {
                i: index,
                w: e.itemCount,
                b: e.value
            };
        });

        var solution = knapsack(formattedEntries, contest.maxItems);

        console.log('found a solve! ', solution);
        
        if (solution.length)
            solve(solution);

        process.exit();
    });
}

function claimPrize() {
    var solution = require('./solutions/' + contestId + '.json');
    console.log('solution', solution);
}

// -- credit to dan woods : https://gist.github.com/danwoods/7496329
function knapsack(items, capacity) {
    var idxItem   = 0,
    idxWeight = 0,
    oldMax    = 0,
    newMax    = 0,
    numItems  = items.length,
    weightMatrix  = new Array(numItems+1),
    keepMatrix    = new Array(numItems+1),
    solutionSet   = [];

    // Setup matrices
    for(idxItem = 0; idxItem < numItems + 1; idxItem++){
        weightMatrix[idxItem] = new Array(capacity+1);
        keepMatrix[idxItem]   = new Array(capacity+1);
    }

    // Build weightMatrix from [0][0] -> [numItems-1][capacity-1]
    for (idxItem = 0; idxItem <= numItems; idxItem++){
        for (idxWeight = 0; idxWeight <= capacity; idxWeight++){

            // Fill top row and left column with zeros
            if (idxItem === 0 || idxWeight === 0){
                weightMatrix[idxItem][idxWeight] = 0;
            }

            // If item will fit, decide if there's greater value in keeping it,
            // or leaving it
            else if (items[idxItem-1].w <= idxWeight){
                newMax = items[idxItem-1].b + weightMatrix[idxItem-1][idxWeight-items[idxItem-1].w];
                oldMax = weightMatrix[idxItem-1][idxWeight];

                // Update the matrices
                if(newMax > oldMax){ 
                    weightMatrix[idxItem][idxWeight]  = newMax;
                    keepMatrix[idxItem][idxWeight]    = 1;
                }
                else{
                    weightMatrix[idxItem][idxWeight]  = oldMax; 
                    keepMatrix[idxItem][idxWeight]    = 0;
                }
            }

            // Else, item can't fit; value and weight are the same as before
            else {
                weightMatrix[idxItem][idxWeight] = weightMatrix[idxItem-1][idxWeight];
            }
        }
    }

    // Traverse through keepMatrix ([numItems][capacity] -> [1][?])
    // to create solutionSet
    idxWeight = capacity;
    idxItem   = numItems;
    for(idxItem; idxItem > 0; idxItem--){
        if(keepMatrix[idxItem][idxWeight] === 1){
            solutionSet.push(items[idxItem - 1]);
            idxWeight = idxWeight - items[idxItem - 1].w;
        }
    }

    return {"maxValue": weightMatrix[numItems][capacity], "set": solutionSet};
}

function run() {
    if (queryPhase) {
        process.exit();
    }

    solveContest(contest);
}

run();
