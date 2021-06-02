const { TOKENS } = require('../../config/tokens.online.js');
module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {

    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    if (hre.network.tags.local || hre.network.tags.test) {
        return;
    }
    //console.dir(TOKENS);
    for (let i = 0; i < TOKENS.length; i ++) {
        let token = TOKENS[i];
        //console.log(i, token.symbol, token.address);
        //console.dir(token);
        let bep20 = await ethers.getContractAt("BEP20", token.address);
        //console.dir(bep20.address);
        let decimals = await bep20.decimals();
        //console.dir(decimals);
        console.log(i, token.symbol, token.address, decimals);
        token.decimals = decimals;
    }
    let result = JSON.stringify(TOKENS, null, 4)
    console.log(result);
};

module.exports.tags = ['GetDecimals'];
module.exports.dependencies = [''];
