// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract BornToken is ERC20 { uint256 public constant MAX_SUPPLY=1_000_000_000 ether; constructor(address treasury) ERC20("MEME BORN","BORN"){require(treasury!=address(0),"Zero treasury");_mint(treasury,MAX_SUPPLY);} }
