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
        let accounts = await getNamedAccounts();

        await deployments.fixture(['BabySwap']);
        this.erc201INCH = await ethers.getContractAt('MockToken', accounts['1INCH']);
        this.erc20USDT = await ethers.getContractAt('MockToken', accounts['USDT']);
        this.babyRouter = await ethers.getContract('BabyRouter');
        this.babyFactory = await ethers.getContract('BabyFactory');
    });

    beforeEach(async function () {
    });

    it("CreateAndDeposit", async function() {
        await this.erc20USDT.mint(this.caller.address, '1000000000000000000');
        await this.erc201INCH.mint(this.caller.address, '1000000000000000000');
        await this.erc20USDT.approve(this.babyRouter.address, '1000000000000000000');
        await this.erc201INCH.approve(this.babyRouter.address, '1000000000000000000');
        console.log(this.erc20USDT.address);
        console.log(this.erc201INCH.address);
        await this.babyRouter.connect(this.caller).addLiquidity(
            this.erc20USDT.address,
            this.erc201INCH.address,
            '1000000000000000000',
            '1000000000000000000',
            '1000000000000000000',
            '1000000000000000000',
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000,
        );
        /*
        let pair = await babyFactory.getPair(WBNB.address, ADA.address);
        pair = await ethers.getContractAt('BabyPair', pair);
        let balance = await pair.balanceOf(this.caller.address);
        console.dir(balance.toString());
        await pair.connect(this.caller).approve(babyRouter.address, balance.toString());
        await babyRouter.connect(this.caller).removeLiquidityETH(
            ADA.address,
            balance.toString(),
            //'99999999999999900',
            '0',
            '0',
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000
        );
        */
        /*
        await this.babyRouter.addLiquidityETH(
            this.bakeERC20.address,
            '1000000000000000000',
            '1000000000000000000',
            '1000000000000000000',
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000,
            {
                value: '1000000000000000000',
            }
        );

        */

        /*
        let erc20BAKE = await ethers.getContractAt('IERC20', TOKEN.BAKE);
        console.log(this.babyRouter.address);
        console.log(TOKEN.BAKE);
        await erc20BAKE.connect(this.caller).approve(this.babyRouter.address, '1000000000000000000');
        let erc20BUSD = await ethers.getContractAt('IERC20', TOKEN.BUSD);
        await erc20BUSD.connect(this.caller).approve(this.babyRouter.address, '1000000000000000000');
        await this.babyRouter.connect(this.caller).addLiquidity(
            TOKEN.BAKE,
            TOKEN.BUSD,
            '1000000000000000000',
            '1000000000000000000',
            '1000000000000000000',
            '1000000000000000000',
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000
        );
        */
    });
});
