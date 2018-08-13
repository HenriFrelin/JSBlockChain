const SHA256 = require('crypto-js/sha256');  // import hashing algorithm used for block validation

class Block{
    // instantiate all of the needed variables
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index
        this.timestamp = timestamp
        this.data = data
        this.previoushash = previousHash
        this.hash = this.calculateHash();
        this.nonce = 0
    }

    calculateHash(){ // returns string value hash that is unique and relative to the block's attributes ^
        return SHA256(this.index.previoushHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        // take substring of this block's hash from 0 -> difficulty(#of zeros needed)
        // do while !== array that is 000...-> difficulty(length)
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++
            this.hash = this.calculateHash()
        }
        console.log("Block Mined: " + this.hash)
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()]; // array[0] is genesis block, line 26 function
        this.difficulty = 4
    }

    createGenesisBlock(){
        return new Block(0, "08/13/2018", "GENSISIS BLOCK", "0") // index in array, date, data, previous hash
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1] // return block on end of array (chain)
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash; // get hash of block on end of chain
        //newBlock.hash = newBlock.calculateHash(); // recalculating hash after var change
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock);
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
        //console.log("BlockChain is Valid!")
        return true; 
    }
}

let FirstBlock = new BlockChain(); 

console.log('Mining Block 1... ')
FirstBlock.addBlock(new Block(1, "8/13/2018", {amount: 1})) // adding example blocks
console.log('Mining Block 2... ')
FirstBlock.addBlock(new Block(2, "8/14/2018", {amount: 13}))
console.log('Mining Block 3... ')
FirstBlock.addBlock(new Block(3, "8/14/2018", {amount: 7}))

console.log('Is the blockchain valid? ' + FirstBlock.isChainValid())
console.log(JSON.stringify(FirstBlock, null, 4))

// Below are tests to ensure immutability of the chain. Uncomment to test!

//FirstBlock.chain[1].data = {amount : 100} 
// ^ This line changes block 1's data value, but doesn't update the hash, 
// so when we check the block to be valid with it's own hash value, it returns false
// This demonstrates the immutability of the blockchain. We test for this in line 40

//FirstBlock.chain[1].hash = FirstBlock.chain[1].calculateHash()
// ^ If one were to ALSO update the hash after making an alteration, the relationship
// of blocks(hashes) in the chain would be broken. We test for this in line 46 

//console.log('Is the blockchain valid? ' + FirstBlock.isChainValid())
