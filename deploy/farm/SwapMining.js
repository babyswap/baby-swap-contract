const { ITEMS } = require('../../config/swapmining.js');
const BigNumber = require('bignumber.js');
module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();
    const {USDT} = await getNamedAccounts();
    const accounts = await getNamedAccounts();

    let babyFactory = await ethers.getContract('BabyFactory');
    await deploy('Oracle', {
        from: deployer.address,
        args: [babyFactory.address],
        log: true,
    });

    let oracle = await ethers.getContract('Oracle');
    let babyToken = await ethers.getContract('BabyToken');
    let babyRouter = await ethers.getContract('BabyRouter');
    let startBlock = 7947563; 
    if (hre.network.tags.local || hre.network.tags.test) {
        startBlock = 9262948;//await ethers.provider.getBlockNumber();
    }
    let babyPerBlock = '8000000000000000000';
    await deploy('SwapMining', {
        from: deployer.address,
        args: [
            babyToken.address,
            babyFactory.address,
            oracle.address,
            babyRouter.address,
            USDT,
            babyPerBlock,
            startBlock
        ],
        log: true,
    });
    let swapMining = await ethers.getContract('SwapMining');
    {
        let isWhiteList = await swapMining.isWhitelist(USDT);
        if (!isWhiteList) {
            let tx = await swapMining.connect(deployer).addWhitelist(USDT);
            tx = await tx.wait();
            console.dir("add whitelist: " + USDT + "(" + 'USDT' + ")");
            console.dir(tx);
        }
    }
    for (let i = 0; i < ITEMS.length; i ++) {
        let item = ITEMS[i];
        console.dir(item);
        let token = accounts[item.token];
        if (item.token == 'BABY') {
            let babyToken = await ethers.getContract('BabyToken');
            token = babyToken.address;
        }
        console.dir(token);
        let allocPoint = new BigNumber(item.percent).times(new BigNumber("10000")).toString();
        //console.dir(allocPoint);
        let isWhiteList = await swapMining.isWhitelist(token);
        if (!isWhiteList) {
            let tx = await swapMining.connect(deployer).addWhitelist(token);
            tx = await tx.wait();
            console.dir("add whitelist: " + token + "(" + item.token + ")");
            console.dir(tx);
        }
        let pair = await babyFactory.expectPairFor(token, USDT);
        //let pid = await swapMining.pairOfPid(pair);
        let pid = i;
        let poolLength = await swapMining.poolLength();
        if (pid >= poolLength) {
            console.log(pid, pair, allocPoint);
            tx = await swapMining.connect(deployer).addPair(allocPoint, pair, false);
            tx = await tx.wait();
            console.dir("addPair: " + pair);
            console.dir(tx);
        }
        //tx = await oracle.update(token, USDT);
        //tx = await tx.wait();
        //console.dir("update oracel: ");
        //console.dir(tx);
    }
    let currentSwapMining = await babyRouter.swapMining();
    if (currentSwapMining != swapMining.address) {
        tx = await babyRouter.connect(deployer).setSwapMining(swapMining.address);
        tx = await tx.wait();
        console.dir("change babyRouter SwapMining to: " + swapMining.address);
        console.dir(tx);
    }
    /*
    let balance = await babyToken.balanceOf(swapMining.address);
    if (balance.toString() == '0') {
        let amount = '320000000000000000000000000';
        tx = await babyToken.connect(deployer).mintFor(swapMining.address, amount);
        tx = await tx.wait();
        console.dir("mint " + amount + " BABY for " + swapMining.address);
        console.dir(tx);
    }
    */
};

module.exports.tags = ['SwapMining'];
module.exports.dependencies = ['BabyToken', 'BabySwap'];
