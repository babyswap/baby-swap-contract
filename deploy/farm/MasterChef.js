module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    let babyToken = await ethers.getContract('BabyToken');
    let syrupBar = await ethers.getContract('SyrupBar');
    let amount = '12000000000000000000'
    let startBlock = 7947563; 
    if (hre.network.tags.local || hre.network.tags.test) {
        startBlock = 9262948;//await ethers.provider.getBlockNumber();
    }
    /*
    let deployResult = await deploy('MasterChef', {
        from: deployer.address,
        args: [
            babyToken.address, 
            syrupBar.address, 
            amount,
            startBlock,
        ],
        log: true,
    });
    */
    let masterChef = await ethers.getContract('MasterChef');
    let owner = await syrupBar.owner();
    if (owner != syrupBar.address) {
        let tx = await babyToken.connect(deployer).transferOwnership(masterChef.address);
        tx = await tx.wait();
        console.log("transfer BabyToken ownership to MasterChef");
        console.dir(tx);
    }
    owner = await syrupBar.owner();
    if (owner != masterChef.address) {
        let tx = await syrupBar.connect(deployer).transferOwnership(masterChef.address);
        tx = await tx.wait();
        console.log("transfer SyrupBar ownership to MasterChef");
        console.dir(tx);
    }
};

module.exports.tags = ['MasterChef'];
module.exports.dependencies = ['SyrupBar', 'BabyToken'];
