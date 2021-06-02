module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();
    const {ecoReceiver} = await getNamedAccounts();

    let babyToken = await ethers.getContract('BabyToken');
    let amount = '90000000000000000000000000'; //9000w
    let deployResult = await deploy('TokenLocker_ECO', {
        from: deployer.address,
        args: [babyToken.address, ecoReceiver, 30 * 24 * 3600, '10000000000000000000000000'],
        log: true,
        contract: 'TokenLocker',
    });
    let tokenLocker = await ethers.getContract('TokenLocker_ECO');
    console.dir(babyToken.address);
    console.dir(tokenLocker.address);
    let balance = await babyToken.balanceOf(tokenLocker.address);
    console.log(amount);
    if (balance.toString() == '0') {
        let tx = await babyToken.connect(deployer).mintFor(tokenLocker.address, amount);
        tx = await tx.wait();
        console.log("mint " + amount + " BABY for TokenLocker_ECO");
        console.dir(tx);
    }
};

module.exports.tags = ['TokenLocker_ECO'];
module.exports.dependencies = ['BabyToken'];
