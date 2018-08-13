const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(index, timestamp, data, previousHash= ''){
        this.index = index
        this.timestamp = timestamp
        this.data = data
        this.previoushash = previousHash
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.index.previoushHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(){
        return new Block(0, "08/13/2018", "GENSISIS BLOCK", "0") // index in array, date, data, previous hash
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1] // return block on end of array (chain)
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash; // get hash of block on end of chain
        newBlock.hash = newBlock.calculateHash(); // recalculating hash after var change
        this.chain.push(newBlock);
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if(currentBlock.hash !== currentBlock.calculateHash()){
                console.log("current block invalid")
                console.log(currentBlock.hash)
                console.log(currentBlock.calculateHash())
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                console.log("previous block invalid")
                return false;
            }
        }
        //console.log("BlockChain is Valid!")
        return true; 
    }
}

let FirstBlock = new BlockChain(); 
FirstBlock.addBlock(new Block(1, "8/13/2018", {amount: 1}))
FirstBlock.addBlock(new Block(2, "8/14/2018", {amount: 13}))
FirstBlock.addBlock(new Block(3, "8/14/2018", {amount: 7}))

console.log('Is the blockchain valid? ' + FirstBlock.isChainValid())
console.log(JSON.stringify(FirstBlock, null, 4))

FirstBlock.chain[1].data = {amount : 100} 
// ^ This line changes block 1's data value, but doesn't update the hash, 
// so when we check the block to be valid with it's own hash value, it returns false
// This demonstrates the immutability of the blockchain. We test for this in line 40
FirstBlock.chain[1].hash = FirstBlock.chain[1].calculateHash()
// If one were to ALSO update the hash after making an alteration, the relationship
// to the previous block would be broken. We test for this in line 46 
console.log('Is the blockchain valid? ' + FirstBlock.isChainValid())
