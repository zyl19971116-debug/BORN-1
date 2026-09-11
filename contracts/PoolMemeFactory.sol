// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./MemeToken.sol";

interface IWETH9 is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function createAndInitializePoolIfNecessary(
        address token0,
        address token1,
        uint24 fee,
        uint160 sqrtPriceX96
    ) external payable returns (address pool);

    function mint(MintParams calldata params)
        external
        payable
        returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
}

/// @notice Permissionless fair-launch factory. The entire token supply and the
/// creator's ETH seed a full-range Uniswap V3 pool. The LP NFT is burned.
contract PoolMemeFactory {
    uint24 public constant POOL_FEE = 3000;
    int24 public constant MIN_TICK = -887220;
    int24 public constant MAX_TICK = 887220;
    address public constant LP_BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant MIN_INITIAL_ETH = 0.001 ether;

    struct Launch {
        address token;
        address creator;
        address pool;
        uint256 positionTokenId;
        uint256 initialEth;
        string name;
        string ticker;
        string metadataURI;
        uint256 createdAt;
    }

    IWETH9 public immutable weth;
    INonfungiblePositionManager public immutable positionManager;
    Launch[] private launches;
    mapping(address => address) public creatorOf;

    event PoolTokenCreated(
        uint256 indexed launchId,
        address indexed token,
        address indexed creator,
        address pool,
        uint256 positionTokenId,
        uint256 initialEth
    );

    constructor(address weth_, address positionManager_) {
        require(weth_ != address(0) && positionManager_ != address(0), "Zero address");
        weth = IWETH9(weth_);
        positionManager = INonfungiblePositionManager(positionManager_);
    }

    function createTokenAndPool(string calldata name, string calldata ticker, string calldata metadataURI)
        external
        payable
        returns (address token, address pool, uint256 positionTokenId)
    {
        require(bytes(name).length >= 2 && bytes(name).length <= 40, "Invalid name");
        require(bytes(ticker).length >= 2 && bytes(ticker).length <= 10, "Invalid ticker");
        require(bytes(metadataURI).length > 0, "Metadata required");
        require(msg.value >= MIN_INITIAL_ETH, "Initial ETH too low");

        token = address(new MemeToken(name, ticker, metadataURI, address(this)));
        uint256 tokenAmount = IERC20(token).balanceOf(address(this));
        weth.deposit{value: msg.value}();

        (address token0, address token1, uint256 amount0, uint256 amount1) = token < address(weth)
            ? (token, address(weth), tokenAmount, msg.value)
            : (address(weth), token, msg.value, tokenAmount);

        uint160 sqrtPriceX96 = uint160(Math.sqrt(Math.mulDiv(amount1, uint256(1) << 192, amount0)));
        pool = positionManager.createAndInitializePoolIfNecessary(token0, token1, POOL_FEE, sqrtPriceX96);

        IERC20(token0).approve(address(positionManager), amount0);
        IERC20(token1).approve(address(positionManager), amount1);
        uint256 used0;
        uint256 used1;
        (positionTokenId,, used0, used1) = positionManager.mint(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: POOL_FEE,
                tickLower: MIN_TICK,
                tickUpper: MAX_TICK,
                amount0Desired: amount0,
                amount1Desired: amount1,
                amount0Min: 0,
                amount1Min: 0,
                recipient: LP_BURN_ADDRESS,
                deadline: block.timestamp
            })
        );

        _refundRemainder(token0, amount0 - used0, msg.sender);
        _refundRemainder(token1, amount1 - used1, msg.sender);

        creatorOf[token] = msg.sender;
        Launch storage launched = launches.push();
        launched.token = token;
        launched.creator = msg.sender;
        launched.pool = pool;
        launched.positionTokenId = positionTokenId;
        launched.initialEth = msg.value;
        launched.name = name;
        launched.ticker = ticker;
        launched.metadataURI = metadataURI;
        launched.createdAt = block.timestamp;
        emit PoolTokenCreated(launches.length - 1, token, msg.sender, pool, positionTokenId, msg.value);
    }

    function _refundRemainder(address asset, uint256 amount, address recipient) private {
        if (amount == 0) return;
        if (asset == address(weth)) {
            weth.withdraw(amount);
            (bool ok,) = recipient.call{value: amount}("");
            require(ok, "ETH refund failed");
        } else {
            require(IERC20(asset).transfer(recipient, amount), "Token refund failed");
        }
    }

    function launchCount() external view returns (uint256) { return launches.length; }
    function getLaunch(uint256 id) external view returns (Launch memory) { return launches[id]; }
    receive() external payable {}
}
