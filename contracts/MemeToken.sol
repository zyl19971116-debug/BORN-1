// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MemeToken is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 ether;
    string public metadataURI;
    constructor(string memory name_, string memory symbol_, string memory uri_, address recipient) ERC20(name_,symbol_) {
        metadataURI=uri_; _mint(recipient,TOTAL_SUPPLY);
    }
}
