const ONLINETOKENS = require('../../config/tokens.online.js');
const TESTTOKENS = require('../../config/tokens.test.js');
const { ITEMS } = require('../../config/ilo.js');
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
    let factory = await ethers.getContract('BabyFactory');
    let accounts = await getNamedAccounts();

    let onlineUSDT = '0x55d398326f99059fF775485246999027B3197955';
    let testUSDT = '0x1bC64Fa1104C96e03F9F06483B64ab6251a8E9E2';
    let tokens = {}
    for (let i = 0; i < ONLINETOKENS.TOKENS.length; i ++) {
        let onlineToken = ONLINETOKENS.TOKENS[i];
        let testToken = TESTTOKENS.TOKENS[i];
        let symbol = onlineToken.symbol;
        tokens[symbol] = {
            'online': onlineToken.address,
            'test': testToken.address,
        };
    }
    for (let i = 0; i < ITEMS.length; i ++) {
        let item = ITEMS[i];
        console.dir(item);
        console.dir(tokens[item.token]);
        //console.dir(tokens);
        let onlineLP = await factory.expectPairFor(tokens[item.token].online, onlineUSDT);
        let testLP = await factory.expectPairFor(tokens[item.token].test, testUSDT);
        console.log(item.token, onlineLP, testLP);
        resultTokens.push({
            pid: i + 239,
            lpSymbol: item.token + '-USDT LP',
            lpAddresses: {
                '56': onlineLP,
                '97': testLP,
            },
            token: '##tokens.' + item.token.toLowerCase() + '##',
            quoteToken: '##tokens.usdt##',
        });
    }


    let result = JSON.stringify(resultTokens, null, 4)
    console.log(result);
};

module.exports.tags = ['ExportTokensForFrontILOPid'];
module.exports.dependencies = [''];
