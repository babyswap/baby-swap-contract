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

    let resultTokens = {};

    for (let i = 0; i < ONLINETOKENS.TOKENS.length; i ++) {
        let onlineToken = ONLINETOKENS.TOKENS[i];
        //console.dir(onlineToken);
        let testToken = TESTTOKENS.TOKENS[i];
        //console.dir(testToken);
        let symbol = onlineToken.symbol;
        resultTokens[symbol.toLowerCase()] = {
            symbol: symbol,
            address: {
                56: onlineToken.address,
                97: testToken.address
            },
            decimals: onlineToken.decimals,
            projectLink: 'https://babyswap.finance/',
        }
    }

    let result = JSON.stringify(resultTokens, null, 4);
    console.log(result);
};

module.exports.tags = ['ExportTokensForFrontILO'];
module.exports.dependencies = [''];
