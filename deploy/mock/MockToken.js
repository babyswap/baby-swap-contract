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

    if (!hre.network.tags.local && !hre.network.tags.test) {
        return;
    }
    //console.dir(TOKENS);
    let resultTokens = [];
    for (let i = 0; i < TOKENS.length; i ++) {
        let token = TOKENS[i];
        //console.dir(token);
        if (token.symbol == 'WBNB') {
            //console.dir(token);
            await deploy('MockToken_WBNB', {
                from: deployer.address,
                args: [],
                log: true,
                contract: 'WBNB',
            });
        } else {
            await deploy('MockToken_' + token.symbol, {
               from: deployer.address,
               args: [token.name, token.symbol, token.decimals],
               log: true,
               contract: 'MockToken',
            });
        }
        let resultToken = await ethers.getContract('MockToken_' + token.symbol);
        resultTokens.push({
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            address: resultToken.address,
        });
    }
    let result = JSON.stringify(resultTokens, null, 4)
    console.log(result);
};

module.exports.tags = ['MockToken'];
module.exports.dependencies = [''];
