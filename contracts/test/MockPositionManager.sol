// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../PoolMemeFactory.sol";

contract MockPositionManager is INonfungiblePositionManager {
    address public constant MOCK_POOL = address(0x1234);
    address public lastRecipient;
    uint160 public lastSqrtPriceX96;

    function createAndInitializePoolIfNecessary(address, address, uint24, uint160 sqrtPriceX96)
        external
        payable
        returns (address)
    {
        lastSqrtPriceX96 = sqrtPriceX96;
        return MOCK_POOL;
    }

    function mint(MintParams calldata params)
        external
        payable
        returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)
    {
        IERC20(params.token0).transferFrom(msg.sender, address(this), params.amount0Desired);
        IERC20(params.token1).transferFrom(msg.sender, address(this), params.amount1Desired);
        lastRecipient = params.recipient;
        return (1, 1, params.amount0Desired, params.amount1Desired);
    }
}
