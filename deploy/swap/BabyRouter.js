const { TOKEN } = require('../../config/address.js');
module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {admin} = await getNamedAccounts();
    const {WBNB} = await getNamedAccounts();
    const {deployer} = await ethers.getNamedSigners();
    let babyFactory = await ethers.getContract('BabyFactory');
    let deployResult = await deploy('BabyRouter', {
        from: deployer.address,
        args: [babyFactory.address, WBNB],
        log: true,
    });
};

module.exports.tags = ['BabyRouter'];
module.exports.dependencies = ['BabyFactory'];
