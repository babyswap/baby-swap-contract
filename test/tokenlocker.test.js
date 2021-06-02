const { TOKEN, RICHACCOUNT } = require('../config/address.js');
const chai = require("chai");
const expect = chai.expect;
//console.dir(chai);
//chai.should()
//chai.use(chaiAsPromised)

describe("TokenLocker", () => {

    before(async function () {

        let signers = await ethers.getSigners();
        this.admin = signers[0];
        this.caller = signers[1];
        this.receiver = signers[2];

        let BabyTokenFactory = await ethers.getContractFactory('BabyToken');
        this.babyToken = await BabyTokenFactory.deploy();
        this.TokenLockerFactory = await ethers.getContractFactory('TokenLocker');

        this.interval = 3600;
        this.releaseAmount = '5000000000000000000000000';
        this.totalAmount = '100000000000000000000000000';
    });

    beforeEach(async function () {
        this.currentBlockNum = await ethers.provider.getBlockNumber();
        this.tokenLocker = await this.TokenLockerFactory.deploy(
            this.babyToken.address, this.receiver.address, this.interval + '', this.releaseAmount
        );
    });

    it("InitValue", async function() {
        expect(await this.tokenLocker.SECONDS_PER_BLOCK()).to.be.equal('3');
        expect(await this.tokenLocker.token()).to.be.equal(this.babyToken.address);
        expect(await this.tokenLocker.receiver()).to.be.equal(this.receiver.address);
        expect(await this.tokenLocker.lastReleaseAt()).to.be.equal(this.currentBlockNum + 1);
        expect(await this.tokenLocker.interval()).to.be.equal(this.interval / 3 + '');
        expect(await this.tokenLocker.releaseAmount()).to.be.equal(this.releaseAmount);
        expect(await this.tokenLocker.totalReleasedAmount()).to.be.equal('0');
    });

    it("LockInfo", async function() {
        let lockInfo = await this.tokenLocker.lockInfo();
        //console.dir(lockInfo);
        expect(lockInfo.amount).to.be.equal('0');
        let diff = Math.abs(lockInfo.timestamp - (this.interval + Math.floor(new Date().getTime() / 1000)));
        //console.dir(diff);
        expect(diff).to.be.below(5);
    });

    it("Claim", async function() {
        await this.babyToken.mintFor(this.tokenLocker.address, this.totalAmount);
        balanceBefore = await this.babyToken.balanceOf(this.receiver.address);
        await this.tokenLocker.claim();
        balanceAfter = await this.babyToken.balanceOf(this.receiver.address);
        expect(balanceAfter.sub(balanceBefore)).to.be.equal('0');

        let currentBlock = await ethers.provider.getBlock();
        //console.dir(currentBlock);
        let now = currentBlock.timestamp;
        //console.dir(await ethers.provider.getBlockNumber());
        let lastReleaseBlock = await this.tokenLocker.lastReleaseAt();
        let remainBlocks = this.interval / 3 - (currentBlock.number - lastReleaseBlock);
        //console.dir(remainBlocks);
        for (let i = 0; i < remainBlocks - 2; i ++) {
            now = now + 3;
            await ethers.provider.send('evm_setNextBlockTimestamp', [now]); 
            await ethers.provider.send('evm_mine');
            //console.dir(await ethers.provider.getBlockNumber());
        }

        balanceBefore = await this.babyToken.balanceOf(this.receiver.address);
        await this.tokenLocker.claim();
        balanceAfter = await this.babyToken.balanceOf(this.receiver.address);
        expect(balanceAfter.sub(balanceBefore)).to.be.equal('0');

        balanceBefore = await this.babyToken.balanceOf(this.receiver.address);
        await this.tokenLocker.claim();
        balanceAfter = await this.babyToken.balanceOf(this.receiver.address);
        expect(balanceAfter.sub(balanceBefore)).to.be.equal(this.releaseAmount);
        expect(await this.tokenLocker.totalReleasedAmount()).to.be.equal(this.releaseAmount);
        expect(await this.tokenLocker.lastReleaseAt()).to.be.equal(await ethers.provider.getBlockNumber());

        balanceBefore = await this.babyToken.balanceOf(this.receiver.address);
        await this.tokenLocker.claim();
        balanceAfter = await this.babyToken.balanceOf(this.receiver.address);
        expect(balanceAfter.sub(balanceBefore)).to.be.equal('0');


        currentBlock = await ethers.provider.getBlock();
        //console.dir(currentBlock);
        now = currentBlock.timestamp;
        //console.dir(await ethers.provider.getBlockNumber());
        lastReleaseBlock = await this.tokenLocker.lastReleaseAt();
        remainBlocks = this.interval / 3 - (currentBlock.number - lastReleaseBlock);
        //console.dir(remainBlocks);
        for (let i = 0; i < remainBlocks + this.interval / 6; i ++) {
            now = now + 3;
            await ethers.provider.send('evm_setNextBlockTimestamp', [now]); 
            await ethers.provider.send('evm_mine');
            //console.dir(await ethers.provider.getBlockNumber());
        }
        balanceBefore = await this.babyToken.balanceOf(this.receiver.address);
        //console.dir((await this.tokenLocker.lastReleaseAt()).toString());
        await this.tokenLocker.claim();
        //console.dir((await this.tokenLocker.lastReleaseAt()).toString());
        balanceAfter = await this.babyToken.balanceOf(this.receiver.address);
        expect(balanceAfter.sub(balanceBefore)).to.be.equal(this.releaseAmount);
        //console.dir(lastReleaseBlock.toString());
        //console.dir(remainBlocks);
        expect(await this.tokenLocker.lastReleaseAt()).to.be.equal(lastReleaseBlock.add(remainBlocks + 1));
        expect(await this.tokenLocker.lastReleaseAt()).to.be.below(await ethers.provider.getBlockNumber());

        currentBlock = await ethers.provider.getBlock();
        //console.dir(currentBlock);
        now = currentBlock.timestamp;
        //console.dir(await ethers.provider.getBlockNumber());
        lastReleaseBlock = await this.tokenLocker.lastReleaseAt();
        remainBlocks = this.interval / 3 - (currentBlock.number - lastReleaseBlock);
        //console.dir(remainBlocks);
        for (let i = 0; i < this.interval / 3 * 17; i ++) {
            now = now + 3;
            await ethers.provider.send('evm_setNextBlockTimestamp', [now]); 
            await ethers.provider.send('evm_mine');
            //console.dir(await ethers.provider.getBlockNumber());
        }
        balanceBefore = await this.babyToken.balanceOf(this.receiver.address);
        //console.dir((await this.tokenLocker.lastReleaseAt()).toString());
        await this.tokenLocker.claim();
        //console.dir((await this.tokenLocker.lastReleaseAt()).toString());
        balanceAfter = await this.babyToken.balanceOf(this.receiver.address);
        expect(balanceAfter.sub(balanceBefore)).to.be.equal('85000000000000000000000000');

        currentBlock = await ethers.provider.getBlock();
        //console.dir(currentBlock);
        now = currentBlock.timestamp;
        //console.dir(await ethers.provider.getBlockNumber());
        lastReleaseBlock = await this.tokenLocker.lastReleaseAt();
        remainBlocks = this.interval / 3 - (currentBlock.number - lastReleaseBlock);
        //console.dir(remainBlocks);
        for (let i = 0; i < remainBlocks; i ++) {
            now = now + 3;
            await ethers.provider.send('evm_setNextBlockTimestamp', [now]); 
            await ethers.provider.send('evm_mine');
            //console.dir(await ethers.provider.getBlockNumber());
        }
        await this.tokenLocker.claim();
        expect(await this.tokenLocker.totalReleasedAmount()).to.be.equal(this.totalAmount);
    });
});
