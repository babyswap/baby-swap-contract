// SPDX-License-Identifier: MIT

pragma solidity =0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract NFTMarket is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct OrderInfo {
        uint256 tokenId;
        address owner;
        uint256 price;
        address nftToken;
        address currency;
    }
    mapping(address => address) public nftTokenAuthors;
    mapping(address => bool) public nftTokenSupported;
    mapping(address => bool) public erc20Supported;
    mapping(address => mapping(uint256 => OrderInfo)) public orderInfos;
    mapping(address => uint256) public nftPriceMaxLimit;
    mapping(address => uint256) public nftPriceMinLimit;

    event SellOrder(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed nftToken,
        uint256 price
    );

    event CancelOrder(address indexed nftToken, uint256 indexed tokenId);

    event BuyOrder(
        uint256 indexed tokenId,
        address nftToken,
        address seller,
        address buyer,
        address erc20,
        uint256 price
    );

    event AddNFTSuppout(address nftToken, address author);
    event RemoveNFTSuppout(address nftToken);
    event AddERC20Suppout(address erc20);
    event RemoveERC20Suppout(address erc20);

    uint256 public taxFeeTotal;
    uint256 public babyFeeTotal;
    uint256 public authorFeeTotal;

    uint256 constant ROUND = 1000000;
    uint256 public taxFee = (3 * ROUND) / 100;
    uint256 public babyFee = (2 * ROUND) / 100;
    uint256 public authorFee = (1 * ROUND) / 100;
    uint256 public constant feeTotalMaxLimit = (10 * ROUND) / 100;

    address public taxReceiver;
    address public babyReceiver;

    function sell(
        address nftToken,
        address currency,
        uint256 tokenId,
        uint256 price
    ) external {
        require(tokenId != 0, "NFTMarket: tokenId can not be 0!");
        require(nftTokenSupported[nftToken], "NFTMarket: Unsupported NFT");
        require(erc20Supported[currency], "NFTMarket: Unsupported tokens");
        require(
            price <= nftPriceMaxLimit[nftToken] ||
                nftPriceMaxLimit[nftToken] == 0,
            "NFTMarket: Maximum price limit exceeded"
        );
        require(
            price >= nftPriceMinLimit[nftToken] && price != 0,
            "NFTMarket: Below the minimum price limit"
        );
        OrderInfo storage orderInfo = orderInfos[nftToken][tokenId];
        orderInfo.tokenId = tokenId;
        orderInfo.nftToken = nftToken;
        orderInfo.owner = msg.sender;
        orderInfo.price = price;
        orderInfo.currency = currency;
        IERC721(nftToken).transferFrom(msg.sender, address(this), tokenId);

        emit SellOrder(tokenId, msg.sender, nftToken, price);
    }

    function buy(address nftToken, uint256 tokenId) external nonReentrant {
        OrderInfo memory orderInfo = orderInfos[nftToken][tokenId];
        require(orderInfo.tokenId != 0, "NFTMarket: NFT does not exist");
        uint256 _taxFee = orderInfo.price.mul(taxFee).div(ROUND);
        uint256 _babyFee = orderInfo.price.mul(babyFee).div(ROUND);
        uint256 _authorFee = orderInfo.price.mul(authorFee).div(ROUND);

        taxFeeTotal = taxFeeTotal.add(_taxFee);
        babyFeeTotal = babyFeeTotal.add(_babyFee);
        authorFeeTotal = authorFeeTotal.add(_authorFee);

        uint256 _amount = orderInfo.price.sub(_taxFee).sub(_babyFee).sub(
            _authorFee
        );

        IERC20(orderInfo.currency).safeTransferFrom(
            msg.sender,
            orderInfo.owner,
            _amount
        );
        IERC20(orderInfo.currency).safeTransferFrom(
            msg.sender,
            nftTokenAuthors[orderInfo.nftToken],
            _authorFee
        );

        IERC20(orderInfo.currency).safeTransferFrom(
            msg.sender,
            taxReceiver,
            _taxFee
        );
        IERC20(orderInfo.currency).safeTransferFrom(
            msg.sender,
            babyReceiver,
            _babyFee
        );

        IERC721(nftToken).safeTransferFrom(address(this), msg.sender, tokenId);

        emit BuyOrder(
            tokenId,
            nftToken,
            orderInfo.owner,
            msg.sender,
            orderInfo.currency,
            orderInfo.price
        );
        delete orderInfos[nftToken][tokenId];
    }

    function cancelOrder(address nftToken, uint256 tokenId)
        external
        nonReentrant
    {
        require(
            orderInfos[nftToken][tokenId].owner == msg.sender,
            "NFTMarket: cancel caller is not owner"
        );
        IERC721(nftToken).safeTransferFrom(address(this), msg.sender, tokenId);
        delete orderInfos[nftToken][tokenId];

        emit CancelOrder(nftToken, tokenId);
    }

    function addNFTTokenSupport(address nftToken, address author)
        external
        onlyOwner
    {
        require(author != address(0), "NFTMarket: author address cannot be 0");
        nftTokenSupported[nftToken] = true;
        nftTokenAuthors[nftToken] = author;
        emit AddNFTSuppout(nftToken, author);
    }

    function removeNFTTokenSupport(address nftToken) external onlyOwner {
        nftTokenSupported[nftToken] = false;
        emit RemoveNFTSuppout(nftToken);
    }

    function addERC20Support(address erc20) external onlyOwner {
        require(erc20 != address(0), "NFTMarket: ERC20 address is zero");
        erc20Supported[erc20] = true;
        emit AddERC20Suppout(erc20);
    }

    function removeERC20Support(address erc20) external onlyOwner {
        erc20Supported[erc20] = false;
        emit RemoveERC20Suppout(erc20);
    }

    function setNFTPriceMaxLimit(address nftToken, uint256 maxLimit)
        external
        onlyOwner
    {
        require(
            maxLimit >= nftPriceMinLimit[nftToken],
            "NFTMarket: maxLimit can not be less than min limit!"
        );
        nftPriceMaxLimit[nftToken] = maxLimit;
    }

    function setNFTPriceMinLimit(address nftToken, uint256 minLimit)
        external
        onlyOwner
    {
        if (nftPriceMaxLimit[nftToken] != 0) {
            require(
                minLimit <= nftPriceMaxLimit[nftToken],
                "NFTMarket: minLimit can not be larger than max limit!"
            );
        }
        nftPriceMinLimit[nftToken] = minLimit;
    }

    function setTaxFee(uint256 _taxFee) external onlyOwner {
        require(
            _taxFee + babyFee + authorFee <= feeTotalMaxLimit,
            "NFTMarket: Maximum fee limit exceeded"
        );
        taxFee = _taxFee;
    }

    function setBabyFee(uint256 _babyFee) external onlyOwner {
        require(
            taxFee + _babyFee + authorFee <= feeTotalMaxLimit,
            "NFTMarket: Maximum fee limit exceeded"
        );
        babyFee = _babyFee;
    }

    function setTaxReceiver(address _taxReceiver) external onlyOwner {
        require(
            _taxReceiver != address(0),
            "NFTMarket: Receiver address is zero"
        );
        taxReceiver = _taxReceiver;
    }

    function setBabyReceiver(address _babyReceiver) external onlyOwner {
        require(
            _babyReceiver != address(0),
            "NFTMarket: Receiver address is zero"
        );
        babyReceiver = _babyReceiver;
    }

    function setAuthorFee(uint256 _authorFee) external onlyOwner {
        require(
            taxFee + babyFee + _authorFee <= feeTotalMaxLimit,
            "NFTMarket: Maximum fee limit exceeded"
        );
        authorFee = _authorFee;
    }
}
