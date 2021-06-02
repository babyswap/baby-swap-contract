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

    let resultTokens = [];

    for (let i = 0; i < ONLINETOKENS.TOKENS.length; i ++) {
        let onlineToken = ONLINETOKENS.TOKENS[i];
        let testToken = TESTTOKENS.TOKENS[i];
        let symbol = onlineToken.symbol;
        resultTokens.push({
            name: onlineToken.name,
            symbol: onlineToken.symbol,
            decimals: onlineToken.decimals,
            chainId: 56,
            address: onlineToken.address,
            logoURI: 'https://exchange.babyswap.finance/images/coins/' + onlineToken.address + '.png',

        });
    }
    let resultJson = {
        name: 'BabySwap Default List',        
        version: {
            major: 2,
            minor: 10,
            patch: 0,
        },
        timestamp: '2021-03-17T09:56:23Z',
        logoURI: 'https://exchange.babywap.finance/images/babyswap.png',
        keywords: [
            'babyswap', 'default'
        ],
        tokens: resultTokens,
    }
    let result = JSON.stringify(resultJson, null, 4)
    console.log(result);
};

module.exports.tags = ['ExportTokensForFrontOnline'];
module.exports.dependencies = [''];
