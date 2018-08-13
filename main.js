const SHA256 = require('crypto-js/sha256');  // import hashing algorithm used for block validation

class Transaction{ // constructor class for transaction(s) for each block
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
}

class Block{
    // instantiate all of the needed variables
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp
        this.transactions = transactions
        this.previousHash = previousHash
        this.hash = this.calculateHash();
        this.nonce = 0 // simple iterator for mineBlock
    }

    calculateHash(){ // returns string value hash that is unique and relative to the block's attributes ^
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty){ // Proof of Work Algorithm 
        // take substring of this block's hash from 0 -> difficulty(#of zeros needed)
        // do while !== array that is 000...-> difficulty(length)
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++
            this.hash = this.calculateHash()
            // keep caclulating hash with nonce++ until # 0s prefaing hash = difficulty
        }
        console.log("Block: " + this.hash)
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()]; // array[0] is genesis block, line 26 function
        this.difficulty = 4
        this.pendingTransactions = []; // empty array to store transaction pool
        this.miningReward = 10 
    }

    createGenesisBlock(){
        return new Block(Date.parse("2018-01-12"), [], "0") // index in array, date, data, previous hash
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1] // return block on end of array (chain)
    }

    minePendingTransactions(miningRewardAddress){ // passed the miner's wallet address
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)
        console.log('Block Mined!')
        this.chain.push(block)
        // Below we reset the pendingTransaction pool and add one transaction
        // being the reward to send to the miner! 
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ]
        // in BTC all pendingTransactions would NOT be passed into the new block,
        // but rather, only the ones chosen to be included, this is because block 
        // size cannot exceed 1mb and pending Transactions > 1mb
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction)
        // add a transaction to the pending pool
    }

    getBalance(address){
        let balance = 0
        // Scan full blockchain and add/subtract all of the outgoing
        // and incoming transactions to get address total balance!
        for(const block of this.chain){ // for every block on this chain
            for(const trans of block.transactions){ // & for every transaction of each block
                if(trans.fromAddress === address){
                    balance -= trans.amount
                }
                if(trans.toAddress === address){
                    balance += trans.amount
                }
            }
        }
        return balance
    }

    isChainValid(){ 
        for(let i = 1; i < this.chain.length; i++){ // scan chain (array) for hash discrepencies
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if(currentBlock.hash !== currentBlock.calculateHash()){ // is the current block's hash correct?
                console.log("current block invalid")
                console.log(currentBlock.hash)
                console.log(currentBlock.calculateHash())
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){ // does the current block's previousHash match? 
                console.log("previous block invalid")
                return false;
            }
        }
        console.log("BlockChain is Valid!")
        return true; 
    }
}

let FirstBlock = new BlockChain(); 
// Demo Transactions -> 'address(x)' is acting as a public key

FirstBlock.createTransaction(new Transaction('null', 'address2', 100))
FirstBlock.createTransaction(new Transaction('null', 'address1', 100))
FirstBlock.createTransaction(new Transaction('null', 'henri-wallet', 100))
// ^ preloading addresses with tokens! 
FirstBlock.createTransaction(new Transaction('address1', 'address2', 3))
FirstBlock.createTransaction(new Transaction('address2', 'address1', 35))
// These transactions are now in the pendingTransactions pool

console.log('\nStarting Mining Process...')
FirstBlock.minePendingTransactions('henri-wallet') // mine with miner's reward address sent
console.log('\nMy new balance is ', FirstBlock.getBalance('henri-wallet'))
console.log('\naddress1 balance is ', FirstBlock.getBalance('address1'))
console.log('\naddress2 balance is ', FirstBlock.getBalance('address2'))

// After this, the mining reward is now in the tx pool, so another start mining again!

console.log('\nStarting Mining Process...')
FirstBlock.minePendingTransactions('random-wallet') // example of another miner verifying my reward!
console.log('\nMy new balance is ', FirstBlock.getBalance('henri-wallet'))
console.log(JSON.stringify(FirstBlock, null, 4))


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //



// Below you will find test code used when building the blockchain. It can be used
// for demonstrative & testing purposes. 
/*
console.log('Mining Block 1... ')
FirstBlock.addBlock(new Block(1, "8/13/2018", {amount: 1})) // adding example blocks
console.log('Mining Block 2... ')
FirstBlock.addBlock(new Block(2, "8/14/2018", {amount: 13}))
console.log('Mining Block 3... ')
FirstBlock.addBlock(new Block(3, "8/14/2018", {amount: 7}))

console.log('Is the blockchain valid? ' + FirstBlock.isChainValid())
console.log(JSON.stringify(FirstBlock, null, 4))
*/

// Below are tests to ensure immutability of the chain. Uncomment to test!

//FirstBlock.chain[1].data = {amount : 100} 
// ^ This line changes block 1's data value, but doesn't update the hash, 
// so when we check the block to be valid with it's own hash value, it returns false
// This demonstrates the immutability of the blockchain. We test for this in line 40

//FirstBlock.chain[1].hash = FirstBlock.chain[1].calculateHash()
// ^ If one were to ALSO update the hash after making an alteration, the relationship
// of blocks(hashes) in the chain would be broken. We test for this in line 46 

//console.log('Is the blockchain valid? ' + FirstBlock.isChainValid())
