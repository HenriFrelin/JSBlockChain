const SHA256 = require('crypto-js/sha256');  // import hashing algorithm used for block validation

class Transaction{ // constructor class for transaction(s) for each block
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
}

class nodeHolder{
    constructor(address, tokensStaked){
        this.tokensStaked = tokensStaked
        this.address = address
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

}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()] // array[0] is genesis block, line 26 function
        this.difficulty = 4
        this.pendingTransactions = [] // empty array to store transaction pool
        this.validationReward = 10 
        this.nodeHolders = [] // array of nodes available to verify blocks
    }

    createGenesisBlock(){
        return new Block(Date.parse("2018-01-12"), [], "0") // index in array, date, data, previous hash
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1] // return block on end of array (chain)
    }

    validatePendingTransactions(){ // passed the miner's wallet address
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
        this.chosenNode = chooseNode() // returns the chosen validation node
        validateBlock(chosenNode, block) // for simulation purposes I am running the validation locally
        console.log('Block Validated by ', this.chosenNode)
        this.chain.push(block)
        // Below we reset the pendingTransaction pool and add one transaction
        // being the reward to send to the miner! 
        this.pendingTransactions = [
            new Transaction(null, chosenNode, this.validationReward)
        ]
        // in BTC all pendingTransactions would NOT be passed into the new block,
        // but rather, only the ones chosen to be included, this is because block 
        // size cannot exceed 1mb and pending Transactions > 1mb
    }

    chooseNode(){
        let chosenNode = this.nodeHolders[0]
        for(const nodeHolder of this.nodeHolders){    // sort list of nodes and choose the one 
            if(nodeHolder.tokensStaked > chosenNode){ // with the most tokens staked
                chosenNode = nodeHolder
            }
        }
        // at this point, the node is chosen. At this point, the node would be triggered to 
        // validate the transaction, but for purposes of this project, I will simulate this 
        // process by acting as if I am the chosen node and running the validation function
        return chosenNode
    }

    validateBlock(chosenNode){
        // I am now assuming the chosen node is my address, but will calculate the txn fees properly

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
// Adding example node holders, 500 stake minimum
FirstBlock.nodes[0] = new nodeHolder('Alex', 500)
FirstBlock.nodes[1] = new nodeHolder('Kyle', 555)
FirstBlock.nodes[2] = new nodeHolder('Zoe', 777)
FirstBlock.nodes[3] = new nodeHolder('Beth', 1876)
FirstBlock.nodes[4] = new nodeHolder('Sam', 666)



// Demo Transactions -> 'address(x)' is acting as a public key

FirstBlock.createTransaction(new Transaction('null', 'address2', 100))
FirstBlock.createTransaction(new Transaction('null', 'address1', 100))
FirstBlock.createTransaction(new Transaction('null', 'henri-wallet', 100))
// ^ preloading addresses with tokens! 
FirstBlock.createTransaction(new Transaction('address1', 'address2', 3))
FirstBlock.createTransaction(new Transaction('address2', 'address1', 35))
// These transactions are now in the pendingTransactions pool

console.log('\nStarting Proof of Stake Validation Process...')
FirstBlock.validatePendingTransactions() // choose node and validate block
console.log('\nMy new balance is ', FirstBlock.getBalance('henri-wallet'))
console.log('\naddress1 balance is ', FirstBlock.getBalance('address1'))
console.log('\naddress2 balance is ', FirstBlock.getBalance('address2'))

// After this, the mining reward is now in the tx pool, so another start mining again!

console.log('\nStarting POS Process...')
FirstBlock.validatePendingTransactions() // validate the remaining txn reward
console.log('\nMy new balance is ', FirstBlock.getBalance('henri-wallet'))
console.log(JSON.stringify(FirstBlock, null, 4))


