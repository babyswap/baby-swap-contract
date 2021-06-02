const ONLINETOKENS = require('../../config/tokens.online.js');
const TESTTOKENS = require('../../config/tokens.test.js');
module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {

    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    let resultTokens = {}

    for (let i = 0; i < ONLINETOKENS.TOKENS.length; i ++) {
        let onlineToken = ONLINETOKENS.TOKENS[i];
        let testToken = TESTTOKENS.TOKENS[i];
        let symbol = onlineToken.symbol;
        resultTokens[symbol] = {
            default: onlineToken.address,
            97: testToken.address,
            56: onlineToken.address,
        }
        //console.log(onlineToken.symbol, onlineToken.address);
    }
    let result = JSON.stringify(resultTokens, null, 4)
    console.log(result);
};

module.exports.tags = ['ExportTokens'];
module.exports.dependencies = [''];
