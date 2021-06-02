const { TOKEN } = require('../../config/address.js');
module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {admin, feeTo} = await getNamedAccounts();
    const {deployer} = await ethers.getNamedSigners();

    let deployResult = await deploy('SmartChefFactory', {
        from: deployer.address,
        args: [],
        log: true,
    });
};

module.exports.tags = ['SmartChefFactory'];
module.exports.dependencies = [];
