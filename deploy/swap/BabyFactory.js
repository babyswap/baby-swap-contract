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

    let deployResult = await deploy('BabyFactory', {
        from: deployer.address,
        args: [admin],
        log: true,
    });

    let babyFactory = await ethers.getContract('BabyFactory');
    let currentFeeTo = await babyFactory.feeTo();
    if (currentFeeTo != feeTo) {
        tx = await babyFactory.connect(deployer).setFeeTo(feeTo);
        tx = await tx.wait();
        console.dir("set feeTo: " + feeTo);
        console.dir(tx);
    }
};

module.exports.tags = ['BabyFactory'];
module.exports.dependencies = [];
