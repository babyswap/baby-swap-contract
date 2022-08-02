// SPDX-License-Identifier: MIT

pragma solidity 0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BabyWonderland is ERC721("Baby Wonderland", "BWL"), Ownable {
    mapping(address => bool) public isMinner;

    event Mint(address account, uint256 tokenId);
    event NewMinner(address account);
    event DelMinner(address account);

    function addMinner(address _minner) external onlyOwner {
        require(
            _minner != address(0),
            "BabyWonderland: minner is zero address"
        );
        isMinner[_minner] = true;
        emit NewMinner(_minner);
    }

    function delMinner(address _minner) external onlyOwner {
        require(
            _minner != address(0),
            "BabyWonderland: minner is the zero address"
        );
        isMinner[_minner] = false;
        emit DelMinner(_minner);
    }

    function mint(address _recipient) public onlyMinner {
        require(
            _recipient != address(0),
            "BabyWonderland: recipient is zero address"
        );
        uint256 _tokenId = totalSupply() + 1;
        _mint(_recipient, _tokenId);
        emit Mint(_recipient, _tokenId);
    }

    function batchMint(address _recipient, uint256 _number)
        external
        onlyMinner
    {
        for (uint256 i = 0; i != _number; i++) {
            mint(_recipient);
        }
    }

    function batchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds
    ) external {
        for (uint256 i = 0; i != tokenIds.length; ++i) {
            transferFrom(from, to, tokenIds[i]);
        }
    }

    function setBaseURI(string memory baseUri) external onlyOwner {
        _setBaseURI(baseUri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory uri = super.tokenURI(tokenId);
        return string(abi.encodePacked(uri, ".json"));
    }

    modifier onlyMinner() {
        require(
            isMinner[msg.sender],
            "BabyWonderland: caller is not the minner"
        );
        _;
    }
}
