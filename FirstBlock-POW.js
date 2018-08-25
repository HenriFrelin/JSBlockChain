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
    constructor(timestamp, transactions, previousHash = '', blockID){
        this.timestamp = timestamp
        this.transactions = transactions
        this.previousHash = previousHash
        this.hash = this.calculateHash();
        this.nonce = 0 // simple iterator for mineBlock
        this.blockID = blockID
    }

    print(){
        console.log("\n       Block " + this.blockID + "\n--------------------\nTimestamp = " + this.timestamp.toString() 
        + "\nCurr Hash = " + this.hash.toString() + "\nPrev Hash = " + this.previousHash.toString() + 
        "\n# of Txns = " + this.transactions.length.toString() + "\n          . \n          .\n          .")
        
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
        this.print()
    }
    
}

class BlockChain{
    constructor(){
        this.difficulty = 1
        this.pendingTransactions = []; // empty array to store transaction pool
        this.miningReward = 10 
        this.txnsPerBlock = 10 // change block size (modular)
        this.blockID = 1
        this.chain = [this.createGenesisBlock()]; // array[0] is genesis block, line 26 function
    }

    createGenesisBlock(){

        console.log("\n    Genesis Block    \n--------------------\nMining Difficulty = " + this.difficulty.toString() 
        + "\nMining Reward = " + this.miningReward.toString() + "\nTxns Per Block = " + this.txnsPerBlock.toString() + "\n          . \n          .\n          .")
        
        return new Block(Date.parse("2018-01-12"), [], "0", null) // index in array, date, data, previous hash
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1] // return block on end of array (chain)
    }

    minePendingTransactions(miningRewardAddress){ // passed the miner's wallet address

        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward))

        if(this.pendingTransactions.length - 1 < this.txnsPerBlock){ // if there are less than max block txns in the pool, process all
            let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash, this.blockID)
            block.mineBlock(this.difficulty)
            this.chain.push(block)
        }
        //otherwise, process only the max block size (specified on line 43)
        else{
            let block = new Block(Date.now(), this.pendingTransactions.slice(this.pendingTransactions.length - this.txnsPerBlock, this.pendingTransactions.length), this.getLatestBlock().hash, this.blockID)
            block.mineBlock(this.difficulty)
            this.chain.push(block)
        }
        
        var p = (this.pendingTransactions.length - 1).toString()        
        
        //Below we prune the COMPLETE txns from the pool
        if(this.pendingTransactions.length - 1 > this.txnsPerBlock){
            this.pendingTransactions = this.pendingTransactions.slice(0, this.pendingTransactions.length - this.txnsPerBlock) // prune the complete txns
        }
        else if(this.pendingTransactions.length - 1 <= this.txnsPerBlock){
            this.pendingTransactions = [] // then all txns have been processed! 
        }
        this.blockID++
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

for(i = 0; i < 100; i++){ // create random transactions
    var key1 = Math.floor((Math.random() * 100) + 1)
    var key2 = Math.floor((Math.random() * 100) + 1)
    var amount = Math.floor((Math.random() * 10) + 1)
    var temp1 = 'address'
    var temp2 = 'address'
    var pubKey1 = temp1 += key1.toString();
    var pubKey2 = temp2 += key2.toString();
    FirstBlock.createTransaction(new Transaction(pubKey1, pubKey2, amount))
    //console.log(pubKey1 + " -> " + pubKey2 + " : " + amount + " tokens")
}

while(FirstBlock.pendingTransactions.length > 0){
    FirstBlock.minePendingTransactions('henri-wallet') // mine with miner's reward address sent
}

//console.log(JSON.stringify(FirstBlock, null, 4))