module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    let deployResult = await deploy('BabyToken', {
        from: deployer.address,
        args: [],
        log: true,
    });
    
    if (hre.network.tags.local || hre.network.tags.test) {
        let token = await ethers.getContract('BabyToken');
        let balance = await token.balanceOf(deployer.address);
        //console.dir(balance);
        if (balance.toString() == '0') {
            let amount = '1000000000000000000000000'; //100w
            let tx = await token.connect(deployer).mintFor(deployer.address, amount);
            tx = await tx.wait();
            console.log("transfer " + amount + " BABY to " + deployer.address);
            console.dir(tx);
        }
    }
};

module.exports.tags = ['BabyToken'];
module.exports.dependencies = [];
