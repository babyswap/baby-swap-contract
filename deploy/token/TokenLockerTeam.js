module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();
    const {teamReceiver} = await getNamedAccounts();

    console.dir(teamReceiver);
    let babyToken = await ethers.getContract('BabyToken');
    let amount = '100000000000000000000000000';
    let deployResult = await deploy('TokenLocker_TEAM', {
        from: deployer.address,
        args: [babyToken.address, teamReceiver, 30 * 24 * 3600, '5000000000000000000000000'],
        log: true,
        contract: 'TokenLocker',
    });
    let tokenLocker = await ethers.getContract('TokenLocker_TEAM');
    let balance = await babyToken.balanceOf(tokenLocker.address);
    if (balance.toString() == '0') {
        let tx = await babyToken.connect(deployer).mintFor(tokenLocker.address, amount);
        tx = await tx.wait();
        console.log("mint " + amount + " BABY for TokenLocker_TEAM");
        console.dir(tx);
    }
};

module.exports.tags = ['TokenLocker_TEAM'];
module.exports.dependencies = ['BabyToken'];
