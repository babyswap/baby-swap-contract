module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
};

module.exports.tags = ['Token'];
module.exports.dependencies = ['BabyToken', 'TokenLocker_ECO', 'TokenLocker_TEAM'];
