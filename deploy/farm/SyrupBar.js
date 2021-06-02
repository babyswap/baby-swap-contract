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
    let deployResult = await deploy('SyrupBar', {
        from: deployer.address,
        args: [babyToken.address],
        log: true,
    });
};

module.exports.tags = ['SyrupBar'];
module.exports.dependencies = ['BabyToken'];
