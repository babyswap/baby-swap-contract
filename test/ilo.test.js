const { TOKEN, RICHACCOUNT } = require('../config/address.js');
const chai = require("chai");
const expect = chai.expect;
//console.dir(chai);
//chai.should()
//chai.use(chaiAsPromised)

describe("ILO", () => {

    before(async function () {
        let signers = await ethers.getSigners();
        this.admin = signers[0];
        this.caller = signers[1];
        const {deployer} = await ethers.getNamedSigners();
        this.deployer = deployer;
        await deployments.fixture(["ILO", 'MockToken']);
        this.lp = await ethers.getContract('BEP20_ADA');
        this.ilo = await ethers.getContract('ILO');
        this.babyToken = await ethers.getContract('BabyToken');
        tx = await this.babyToken.connect(this.deployer).transfer(this.ilo.address, '1000000000000000000000');
        tx = await tx.wait();
    });

    beforeEach(async function () {
    });

    it("Add", async function() {
        tx = await this.ilo.add('3000', this.lp.address);
        tx = await tx.wait();
    });

    it("Start", async function() {
        tx = await this.ilo.setStartBlock('1');
        tx = await tx.wait();
        tx = await this.ilo.setEndBlock('1000000000000000000');
        tx = await tx.wait();
    });

    it("Deposit", async function() {
        tx = await this.lp.connect(this.deployer).approve(this.ilo.address, '1000000000000000000');
        tx = await tx.wait();
        tx = await this.ilo.deposit(0, '1000000000000000000');
        tx = await tx.wait();
    });

    it("End", async function() {
        tx = await this.ilo.setStartBlock('1');
        tx = await tx.wait();
        tx = await this.ilo.setEndBlock('2');
        tx = await tx.wait();
    });

    it("Withdraw", async function() {
        tx = await this.ilo.withdraw(0);
        tx = await tx.wait();
    });

});
