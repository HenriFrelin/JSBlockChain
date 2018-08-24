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
        this.difficulty = 3
        this.pendingTransactions = []; // empty array to store transaction pool
        this.miningReward = 10 
        this.txnsPerBlock = 10 // change block size (modular)
    }

    createGenesisBlock(){
        return new Block(Date.parse("2018-01-12"), [], "0") // index in array, date, data, previous hash
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1] // return block on end of array (chain)
    }

    minePendingTransactions(miningRewardAddress){ // passed the miner's wallet address

        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward))

        if(this.pendingTransactions.length - 1 < this.txnsPerBlock){ // if there are less than max block txns in the pool, process all
            let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
            block.mineBlock(this.difficulty)
            console.log('Block Mined!')
            this.chain.push(block)
        }
        //otherwise, process only the max block size (specified on line 43)
        else{
            let block = new Block(Date.now(), this.pendingTransactions.slice(this.pendingTransactions.length - this.txnsPerBlock, this.pendingTransactions.length), this.getLatestBlock().hash)
            block.mineBlock(this.difficulty)
            console.log('Block Mined!')
            this.chain.push(block)
        }
        //let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
        // above we slice the top # of txns that specifies the max txns per block
        //block.transactions.push(new Transaction(null, miningRewardAddress, this.miningReward)) // miner processes his own reward txn 
       
        // Below we reset the pendingTransaction pool and add one transaction
        // being the reward to send to the miner! 

        //this.pendingTransactions.pop()
        var p = (this.pendingTransactions.length - 1).toString()
        console.log("PENDING TXN # = " + p)
        
        if(this.pendingTransactions.length - 1 > this.txnsPerBlock){
            this.pendingTransactions = this.pendingTransactions.slice(0, this.pendingTransactions.length - this.txnsPerBlock) // prune the complete txns
        }
        else if(this.pendingTransactions.length - 1 <= this.txnsPerBlock){
            this.pendingTransactions = [] // then all txns have been processed! 
        }
    }

    createTransaction(transaction){
        if(this.getBalance(transaction.fromAddress) <= 0 && transaction.fromAddress != 'null'){ // if it's from null it is not a standard transfer of funds (eg: rewards or testing)
            console.log("Insufficient Funds")
        }
        else{
            this.pendingTransactions.push(transaction)
        }
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

for(i = 0; i < 100; i++){ // preload every account with 100 tokens
    var publicKey = 'address'
    publicKey += i.toString()
    FirstBlock.createTransaction(new Transaction('null', publicKey, 100))
}

while(FirstBlock.pendingTransactions.length > 0){
    FirstBlock.minePendingTransactions('henri-wallet') // mine with miner's reward address sent
}

for(i = 0; i < 500; i++){ // create random transactions
    var key1 = Math.floor(Math.random() * Math.floor(101));
    var key2 = Math.floor(Math.random() * Math.floor(101));
    var amount = Math.floor(Math.random() * Math.floor(100000));
    var temp1 = 'address'
    var temp2 = 'address'
    var pubKey1 = temp1 += key1.toString();
    var pubKey2 = temp2 += key2.toString();
    FirstBlock.createTransaction(new Transaction(pubKey1, pubKey2, amount))
    console.log(pubKey1 + " -> " + pubKey2 + " : " + amount + " tokens")
}

while(FirstBlock.pendingTransactions.length > 0){
    FirstBlock.minePendingTransactions('henri-wallet') // mine with miner's reward address sent
}

//console.log(JSON.stringify(FirstBlock, null, 4))

/*
FirstBlock.createTransaction(new Transaction('null', 'address2', 100))
FirstBlock.createTransaction(new Transaction('null', 'address1', 100))
FirstBlock.createTransaction(new Transaction('null', 'henri-wallet', 100))
while(FirstBlock.pendingTransactions.length > 0){
    FirstBlock.minePendingTransactions('henri-wallet') // mine with miner's reward address sent
}// ^ preloading addresses with tokens! 
FirstBlock.createTransaction(new Transaction('address1', 'address2', 3))
FirstBlock.createTransaction(new Transaction('address2', 'address1', 35))
// These transactions are now in the pendingTransactions pool
console.log('\nMy new balance is ', FirstBlock.getBalance('henri-wallet'))
console.log('\naddress1 balance is ', FirstBlock.getBalance('address1'))
console.log('\naddress2 balance is ', FirstBlock.getBalance('address2'))
console.log('\nStarting Mining Process...')

while(FirstBlock.pendingTransactions.length > 0){
    FirstBlock.minePendingTransactions('henri-wallet') // mine with miner's reward address sent
}

console.log('\nMy new baqlance is ', FirstBlock.getBalance('henri-wallet'))
console.log('\naddress1 balance is ', FirstBlock.getBalance('address1'))
console.log('\naddress2 balance is ', FirstBlock.getBalance('address2'))
console.log(JSON.stringify(FirstBlock, null, 4))

*/




