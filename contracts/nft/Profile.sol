// SPDX-License-Identifier: MIT

pragma solidity >=0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Profile is ERC721("Profile", "Profile"), Ownable {
    using SafeERC20 for IERC20;

    mapping(address => bool) public isMinted;

    uint256 public mintFee;

    IERC20 public immutable babyToken;

    uint256 public immutable startMintTime;

    uint256 public constant maxTokenId = 10000;

    uint256 public constant minTokenId = 1;

    address public constant hole = 0x000000000000000000000000000000000000dEaD;

    uint256 public mintTotal;

    mapping(uint256 => address) public mintOwners;

    event Mint(uint256 orderId, address account);

    constructor(
        IERC20 _babyToken,
        uint256 _mintFee,
        uint256 _startMintTime
    ) {
        babyToken = _babyToken;
        mintFee = _mintFee;
        startMintTime = _startMintTime;
    }

    function setMintFee(uint256 _mintFee) external onlyOwner {
        mintFee = _mintFee;
    }

    function mint() external {
        require(!isMinted[msg.sender], "Profile: mint already involved");
        require(mintTotal < maxTokenId, "Profile: End of issuance");
        require(
            block.timestamp > startMintTime,
            "Profile: It's not the start time"
        );
        isMinted[msg.sender] = true;
        mintTotal = mintTotal + 1;
        mintOwners[mintTotal] = msg.sender;
        babyToken.safeTransferFrom(msg.sender, hole, mintFee);
        emit Mint(mintTotal, msg.sender);
    }

    function grant(uint256 orderId, uint256 tokenId) external onlyOwner {
        require(!_exists(tokenId), "Profile: token already exists");
        require(
            mintOwners[orderId] != address(0),
            "Profile: token already exists"
        );
        require(
            tokenId >= minTokenId && tokenId <= maxTokenId,
            "Profile: tokenId is invalid"
        );
        _mint(mintOwners[orderId], tokenId);
        delete mintOwners[orderId];
    }

    function setBaseURI(string memory baseUri) external onlyOwner {
        _setBaseURI(baseUri);
    }
}
