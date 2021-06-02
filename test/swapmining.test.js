const { TOKEN, RICHACCOUNT } = require('../config/address.js');
const chai = require("chai");
const expect = chai.expect;
//console.dir(chai);
//chai.should()
//chai.use(chaiAsPromised)

describe("Swap", () => {

    before(async function () {
        let signers = await ethers.getSigners();
        this.admin = signers[0];
        this.caller = signers[1];
        const {deployer} = await ethers.getNamedSigners();
        this.deployer = deployer;
        await deployments.fixture(['SwapMining']);
        this.babyToken = await ethers.getContract('BabyToken');
        this.swapMining = await ethers.getContract('SwapMining');
        tx = await this.babyToken.connect(this.deployer).transfer(this.swapMining.address, '100000000000000000000');
    });

    beforeEach(async function () {
    });

    it("CreateAndDeposit", async function() {

        this.ADA = await ethers.getContract('BEP20_ADA');
        this.USDT = await ethers.getContract('BEP20_USDT');
        this.babyRouter = await ethers.getContract('BabyRouter');
        this.babyFactory = await ethers.getContract('BabyFactory');
        await this.ADA.connect(this.deployer).approve(this.babyRouter.address, '2000000000000000000');
        await this.USDT.connect(this.deployer).approve(this.babyRouter.address, '1000000000000000000');
        //console.dir((await ADA.balanceOf(this.deployer.address)).toString());
        //console.dir((await USDT.balanceOf(this.deployer.address)).toString());
        await this.babyRouter.connect(this.deployer).addLiquidity(
            this.ADA.address,
            this.USDT.address,
            '2000000000000000000',
            '1000000000000000000',
            '2000000000000000000',
            '1000000000000000000',
            this.deployer.address,
            Math.floor(new Date().getTime() / 1000) + 1000
        );
        let pair = await this.babyFactory.getPair(this.USDT.address, this.ADA.address);
        //console.dir(pair);
        pair = await this.babyFactory.expectPairFor(this.USDT.address, this.ADA.address);
        //console.dir(pair);
        pair = await this.babyFactory.expectPairFor(this.ADA.address, this.USDT.address);
        //console.dir(pair);
    });

    it("Swap", async function() {
        let pair = await this.babyFactory.getPair(this.USDT.address, this.ADA.address);
        this.swapMining = await ethers.getContract('SwapMining');
        let tx = await this.swapMining.addPair('1000', pair, true);
        tx = await tx.wait();
        await this.ADA.connect(this.deployer).approve(this.babyRouter.address, '200000000000000000');
        await this.babyRouter.connect(this.deployer).swapExactTokensForTokens(
            '200000000000000000',
            '0',
            [this.ADA.address, this.USDT.address],
            this.deployer.address,
            Math.floor(new Date().getTime() / 1000) + 1000
        );
    });

    it("getUserReward", async function() {
        await ethers.provider.send("evm_increaseTime", [60])
        await network.provider.send("evm_mine", []);
        await network.provider.send("evm_mine", []);
        await network.provider.send("evm_mine", []);
        let reward = await this.swapMining.connect(this.deployer).getUserReward(0);
        //console.dir(reward.toString());
    });

    it("Withdraw", async function() {
        tx = await this.swapMining.takerWithdraw();
        tx = await tx.wait();
    });

});
