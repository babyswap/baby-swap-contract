module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    let masterChef = await ethers.getContract('MasterChef');
    console.log("masterChef: ", masterChef.address);
    await deploy('MasterChefTimelock', {
        from: deployer.address,
        args: [masterChef.address, deployer.address, 60 * 60 * 48],
        log: true,
    });
    let currentPools = {
        '0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657' : 0,
        '0x2b1Ab050D9975c5449B12B2a084630F51d14D80f' : 1,
        '0x04580ce6dEE076354e96fED53cb839DE9eFb5f3f': 2,
        '0x249cd054697f41d73F1A81fa0F5279fcce3cF70c': 3,
        '0xDFC792757C72FBe0d163c808ee94Cd691eC740D3': 4,
        '0xBAfC96DbCa5Df5dBd1c9AF5479Fe65bE8FBF9daf': 5,
        '0xcF84f1e50eE4FbeFAC8822C06D0ed01a28904c50': 6,
        '0xfa0C1bD534784b978b4d5c426836f7c44f5C0b20': 7,
        '0x5784425C93F264ef667A0695317196a3bb457C55': 8,
        '0xcb2828964FDa6A0eC8ed1C0b95E73A5eE58CF16A': 9,
        '0x14a07c28138c75c3B7253bC50fd077aa405A2A48': 10,
        '0x97aF56C43C45bdcB08fD826D8F4f4dB8D1e11BF7': 11,
        '0x5Bd603EB0816d2cF35B927Ded59a53b5A2b18fCA': 12,
        '0xcc21b0A9A01fcD2103ff75614480Bd6a07869053': 13,
        '0xF739D76Fb14f39a5efe6622215384E8d2BD86e23': 14,
        '0x14C594222106283dd6D155b9d00a943b94153066': 15,
        '0x09eF640df704a75921b3489539fAdAcF1D594F85': 16,
        '0xAB8C7Ef18a51fb865FCEEb8773Fd801fBF89DDA7': 17,
        '0xc71ae603efb29bC8EedD9C9c5323011e167179a2': 18,
        '0xA6c273efA963bDcb09454B40a3d0d4e25AFd8745': 19,
        '0x2c0d74d5389a7076DC76f7084AD333112bA11AE0': 20,
        '0xFf7FE3CCe98901af02Ea8D0d577Dd2EAB831fe50': 21,
        '0xd75e61F069e812D7a28caB0A82a0999316D9Ec52': 22,
        '0x18ee2af3E2D645d09C2B6e08b3651916a07a4A28': 23,
        '0x74c4DA0DAca1A9e52Faec732d96BC7dEA9FB3ac1': 24,
        '0x1E0F11671362E4163eb5530ffFA2f01d4028cdf9': 25,
        '0xf85ec97E26F0c63C102722E886866B686F61b5a6': 26,
        '0x94Fe737506788C07036A3427db5Dee7CAE599897': 27,
        '0xE730C7B7470447AD4886c763247012DfD233bAfF': 28,
        '0xd3618eedc97CE2f2cCc5db6ee36C9D2f9E6Afd8d': 29,
        '0xcBB2CCB2b443BAe3e299ec9a981cB73935ad153C': 30,
        '0xe29aC3830Feb76dc970A2Aee2dC0E3A98d1d2b15': 31,
    }
    let masterChefTimelock = await ethers.getContract('MasterChefTimelock');
    for (pool in currentPools) {
        let pid = currentPools[pool];
        //console.log(pool, pid);
        let exists = await masterChefTimelock.existsPools(pool);
        if (!exists) {
            tx = await masterChefTimelock.connect(deployer).addExistsPools(pool, pid);
            tx = await tx.wait();
            console.log("add exist pid " + pool + "," + pid);
            console.dir(tx);
        }
    }
    let currentAdmin = await masterChef.owner();
    if (currentAdmin != masterChefTimelock.address) {
        console.log("current Admin: " + currentAdmin);
        console.log("set Admin: " + masterChefTimelock.address);
        tx = await masterChef.connect(deployer).transferOwnership(masterChefTimelock.address);
        tx = await tx.wait();
        console.log("transfer master chef owner to " + masterChefTimelock.address);
        console.dir(tx);
    }
};

module.exports.tags = ['MasterChefTimelock'];
module.exports.dependencies = [];
