require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-spdx-license-identifier");
require('hardhat-deploy');
require ('hardhat-abi-exporter');
require("@nomiclabs/hardhat-ethers");
require("dotenv/config")
const { TOKENS } = require('./config/tokens.js');

let accounts = [];
var fs = require("fs");
var read = require('read');
var util = require('util');
const keythereum = require("keythereum");
const prompt = require('prompt-sync')();
(async function() {
    try {
        const root = '.keystore';
        var pa = fs.readdirSync(root);
        for (let index = 0; index < pa.length; index ++) {
            let ele = pa[index];
            let fullPath = root + '/' + ele;
		    var info = fs.statSync(fullPath);
            //console.dir(ele);
		    if(!info.isDirectory() && ele.endsWith(".keystore")){
                const content = fs.readFileSync(fullPath, 'utf8');
                const json = JSON.parse(content);
                const password = prompt('Input password for 0x' + json.address + ': ', {echo: '*'});
                //console.dir(password);
                const privatekey = keythereum.recover(password, json).toString('hex');
                //console.dir(privatekey);
                accounts.push('0x' + privatekey);
                //console.dir(keystore);
		    }
	    }
    } catch (ex) {
    }
    try {
        const file = '.secret';
        var info = fs.statSync(file);
        if (!info.isDirectory()) {
            const content = fs.readFileSync(file, 'utf8');
            let lines = content.split('\n');
            for (let index = 0; index < lines.length; index ++) {
                let line = lines[index];
                if (line == undefined || line == '') {
                    continue;
                }
                if (!line.startsWith('0x') || !line.startsWith('0x')) {
                    line = '0x' + line;
                }
                accounts.push(line);
            }
        }
    } catch (ex) {
    }
})();

module.exports = {
    defaultNetwork: "hardhat",
    abiExporter: {
        path: "./abi",
        clear: false,
        flat: true,
        // only: [],
        // except: []
    },
    namedAccounts: {
        deployer: {
            default: 0,
            97: '0x5C7b53292f4444674A674667887E781e4C4649d7',
            56: '0xC0a56aeE755Bd397235367008f7c2c4599768395',
        },
        admin: {
            default: 1,
            97: '0x5C7b53292f4444674A674667887E781e4C4649d7',
            56: '0xC0a56aeE755Bd397235367008f7c2c4599768395',
        },
        ecoReceiver: {
            default: 2,
            97: '0x5C7b53292f4444674A674667887E781e4C4649d7',
            56: '0x889af9fd0E202A6e7215D84beCF07A229a9CF4e2',
        },
        teamReceiver: {
            default: 3,
            97: '0x5C7b53292f4444674A674667887E781e4C4649d7',
            56: '0xb8b0DA08d7ecDAA8CdCe3F1D859A0988bd8B9236',
        },
        feeTo: {
            default: '0x053322176C6E2B5cAeb92F5C943546DB53a2E2Fa',
            97: '0x053322176C6E2B5cAeb92F5C943546DB53a2E2Fa',
            56: '0x053322176C6E2B5cAeb92F5C943546DB53a2E2Fa',
        },
    },
    networks: {
        mainnet: {
            //url: `https://bsc-dataseed3.binance.org`,
            url: `https://bsc-dataseed1.defibit.io/`,
            accounts: accounts,
            //gasPrice: 1.3 * 1000000000,
            chainId: 56,
            gasMultiplier: 1.5,
        },
        test: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
            accounts: accounts,
            //gasPrice: 1.3 * 1000000000,
            chainId: 97,
            tags: ["test"],
        },
        hardhat: {
            forking: {
                enabled: true,
                url: `https://bsc-dataseed1.defibit.io/`
                //url: `https://bsc-dataseed1.ninicoin.io/`
                //url: `https://bsc-dataseed3.binance.org/`
                //url: `https://data-seed-prebsc-1-s1.binance.org:8545`
            },
            live: true,
            saveDeployments: true,
            tags: ["test", "local"],
            chainId: 56,
            timeout: 2000000,
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.7.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    spdxLicenseIdentifier: {
        overwrite: true,
        runOnCompile: true,
    },
    mocha: {
        timeout: 2000000,
    },
    etherscan: {
     apiKey: process.env.BSC_API_KEY,
   }
};

(function() {
    Object.assign(module.exports.namedAccounts, TOKENS);
})()
