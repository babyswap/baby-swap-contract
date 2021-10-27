// SPDX-License-Identifier: MIT

pragma solidity >=0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import '../interfaces/IBabyFactory.sol';
import '../interfaces/IBabyRouter02.sol';
import '../libraries/TransferHelper.sol';
import '../libraries/BabyLibrary.sol';
import '../libraries/SafeMath.sol';
import '../interfaces/IERC20.sol';
import '../interfaces/IWETH.sol';
import 'hardhat/console.sol';

interface ISwapMining {
    function swap(address account, address input, address output, uint256 amount) external returns (bool);
}


contract BabyRouter is IBabyRouter02, Ownable {
    using SafeMath for uint;

    address public immutable override factory;
    address[] public factories;
    uint[] public fees;
    mapping(address => uint) public tokenMinAmount;
    address immutable oldRouter;

    address public immutable override WETH;
    address public swapMining;

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'BabyRouter');
        _;
    }

    function setSwapMining(address _swapMininng) public onlyOwner {
        swapMining = _swapMininng;
    }

    constructor(address _oldRouter, address _factory, uint _fee, address _WETH) {
        oldRouter = _oldRouter;
        factory = _factory;
        WETH = _WETH;
        factories.push(_factory);
        fees.push(_fee);
    }

    function setFactoryAndFee(uint _id, address _factory, uint _fee) external onlyOwner {
        require(_id > 0, "index 0 cannot be set");
        if (_id < factories.length) {
            factories[_id] = _factory;
            fees[_id] = _fee;
        } else {
            require(_id == factories.length, "illegal idx");
            factories.push(_factory);
            fees.push(_fee);
        }
    }

    function delFactoryAndFee(uint _id) external onlyOwner {
        require(_id > 0, "index 0 cannot be set");
        if (_id == factories.length - 1) {
            factories.pop();
            fees.pop();
        } else {
            factories[_id] = address(0);
            fees[_id] = 0;
        }
    }

    function setTokenMinAmount(address _token, uint _amount) external onlyOwner {
        tokenMinAmount[_token] = _amount;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external virtual override payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountA, uint amountB) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountToken, uint amountETH) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external virtual override returns (uint amountA, uint amountB) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external virtual override returns (uint amountToken, uint amountETH) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }

    // **** REMOVE LIQUIDITY (supporting fee-on-transfer tokens) ****
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountETH) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external virtual override returns (uint amountETH) {
        (bool success, ) = oldRouter.delegatecall(msg.data); 
        assembly {
            if eq(success, 0) {
                revert(0, 0)
            }
        }
    }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address[] memory usedFactories, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = BabyLibrary.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            if (swapMining != address(0) && usedFactories[i] == factory) {
                ISwapMining(swapMining).swap(msg.sender, input, output, amountOut);
            }
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? BabyLibrary.pairFor(usedFactories[i + 2], output, path[i + 2]) : _to;
            IBabyPair(BabyLibrary.pairFor(usedFactories[i + 1], input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        address[] memory usedFactories;
        (amounts, usedFactories) = BabyLibrary.getAggregationAmountsOut(factories, fees, minAmounts, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'BabyRouter: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, BabyLibrary.pairFor(factories[1], path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, usedFactories, to);
    }
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        address[] memory usedFactories;
        (amounts, usedFactories) = BabyLibrary.getAggregationAmountsIn(factories, fees, minAmounts, amountOut, path);
        require(amounts[0] <= amountInMax, 'BabyRouter: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, BabyLibrary.pairFor(factories[1], path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, usedFactories, to);
    }
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        address[] memory usedFactories;
        require(path[0] == WETH, 'BabyRouter: INVALID_PATH');
        (amounts, usedFactories) = BabyLibrary.getAggregationAmountsOut(factories, fees, minAmounts, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'BabyRouter: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(BabyLibrary.pairFor(factories[1], path[0], path[1]), amounts[0]));
        _swap(amounts, path, usedFactories, to);
    }
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        address[] memory usedFactories;
        require(path[path.length - 1] == WETH, 'BabyRouter: INVALID_PATH');
        (amounts, usedFactories) = BabyLibrary.getAggregationAmountsIn(factories, fees, minAmounts, amountOut, path);
        require(amounts[0] <= amountInMax, 'BabyRouter: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, BabyLibrary.pairFor(factories[1], path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, usedFactories, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        address[] memory usedFactories;
        require(path[path.length - 1] == WETH, 'BabyRouter: INVALID_PATH');
        (amounts, usedFactories) = BabyLibrary.getAggregationAmountsOut(factories, fees, minAmounts, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'BabyRouter: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, BabyLibrary.pairFor(factories[1], path[0], path[1]), amounts[0]
        );
        _swap(amounts, usedFactories, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        address[] memory usedFactories;
        require(path[0] == WETH, 'BabyRouter: INVALID_PATH');
        (amounts, usedFactories) = BabyLibrary.getAggregationAmountsIn(factories, fees, minAmounts, amountOut, path);
        require(amounts[0] <= msg.value, 'BabyRouter: EXCESSIVE_INPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(BabyLibrary.pairFor(factories[1], path[0], path[1]), amounts[0]));
        _swap(amounts, usedFactories, path, to);
        // refund dust eth, if any
        if (msg.value > amounts[0]) TransferHelper.safeTransferETH(msg.sender, msg.value - amounts[0]);
    }

    function getReserve(IBabyPair pair, address token0, address token1) internal view returns(uint reserve0, uint reserve1, address token) {
        (token,) = BabyLibrary.sortTokens(token0, token1);
        (uint _reserve0, uint _reserve1,) = pair.getReserves();
        (reserve0, reserve1) = token0 == token ? (_reserve0, _reserve1) : (_reserve1, _reserve0);
    }

    // **** SWAP (supporting fee-on-transfer tokens) ****
    // requires the initial amount to have already been sent to the first pair
    function _swapSupportingFeeOnTransferTokens(address[] memory path, address[] memory pairs, uint[] memory usedFees, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (uint reserveInput, uint reserveOutput, address token0) = getReserve(IBabyPair(pairs[i + 1]), input, output);
            uint amountInput;
            uint amountOutput;
            { // scope to avoid stack too deep errors
            amountInput = IERC20(input).balanceOf(address(pairs[i + 1])).sub(reserveInput);
            amountOutput = BabyLibrary.getAmountOutWithFee(amountInput, reserveInput, reserveOutput, usedFees[i + 1]);
            }
            if (swapMining != address(0) && IBabyPair(pairs[i + 1]).factory() == factory) {
                ISwapMining(swapMining).swap(msg.sender, input, output, amountOutput);
            }
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOutput) : (amountOutput, uint(0));
            address to = i < path.length - 2 ? pairs[i + 2] : _to;
            IBabyPair(pairs[i + 1]).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    function getPairs(address[] calldata path) internal view returns (address[] memory pairs, uint[] memory usedFees) {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        for (uint i = 0; i < path.length - 1; i ++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = BabyLibrary.sortTokens(input, output);
            uint j = 0;
            for (; j < factories.length; j ++) {
                IBabyPair pair = IBabyPair(BabyLibrary.pairFor(factories[j], path[i], path[i + 1]));
                (uint reserve0, uint reserve1,) = pair.getReserves();
                (uint reserveInput, uint reserveOutput) = input == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
                if (reserveInput >= minAmounts[i] && reserveOutput >= minAmounts[i + 1]) {
                    pairs[i + 1] = address(pair);
                    usedFees[i + 1] = fees[j];
                    break;
                }
            }
            if (j == factories.length) {
                pairs[i + 1] = BabyLibrary.pairFor(factories[0], path[i], path[i + 1]); 
                usedFees[i + 1] = fees[0];
            }
        }
    }

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) {
        address[] memory pairs = new address[](path.length);
        uint[] memory usedFees = new uint[](path.length);
        (pairs, usedFees) = getPairs(path);
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, pairs[1], amountIn
        );
        uint balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        _swapSupportingFeeOnTransferTokens(path, pairs, usedFees,  to);
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >= amountOutMin,
            'BabyRouter'
        );
    }
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        virtual
        override
        payable
        ensure(deadline)
    {
        require(path[0] == WETH, 'BabyRouter');
        uint amountIn = msg.value;
        IWETH(WETH).deposit{value: amountIn}();
        address[] memory pairs = new address[](path.length);
        uint[] memory usedFees = new uint[](path.length);
        (pairs, usedFees) = getPairs(path);
        assert(IWETH(WETH).transfer(pairs[1], amountIn));
        uint balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        _swapSupportingFeeOnTransferTokens(path, pairs, usedFees, to);
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >= amountOutMin,
            'BabyRouter'
        );
    }
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        virtual
        override
        ensure(deadline)
    {
        require(path[path.length - 1] == WETH, 'BabyRouter: INVALID_PATH');
        address[] memory pairs = new address[](path.length);
        uint[] memory usedFees = new uint[](path.length);
        (pairs, usedFees) = getPairs(path);
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, pairs[1], amountIn
        );
        _swapSupportingFeeOnTransferTokens(path, pairs, usedFees, address(this));
        uint amountOut = IERC20(WETH).balanceOf(address(this));
        require(amountOut >= amountOutMin, 'BabyRouter: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETH(WETH).withdraw(amountOut);
        TransferHelper.safeTransferETH(to, amountOut);
    }

    // **** LIBRARY FUNCTIONS ****
    function quote(uint amountA, uint reserveA, uint reserveB) public pure virtual override returns (uint amountB) {
        return BabyLibrary.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        override
        returns (uint amountOut)
    {
        return BabyLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        override
        returns (uint amountIn)
    {
        return BabyLibrary.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint amountIn, address[] memory path)
        public
        view
        virtual
        override
        returns (uint[] memory amounts)
    {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        (amounts, ) = BabyLibrary.getAggregationAmountsOut(factories, fees, minAmounts, amountIn, path);
    }

    function getAmountsIn(uint amountOut, address[] memory path)
        public
        view
        virtual
        override
        returns (uint[] memory amounts)
    {
        uint[] memory minAmounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i ++) {
            minAmounts[i] = tokenMinAmount[path[i]];
        }
        (amounts, ) = BabyLibrary.getAggregationAmountsIn(factories, fees, minAmounts, amountOut, path);
    }
}
