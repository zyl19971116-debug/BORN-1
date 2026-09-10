// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";
contract DailyMarketCapOracle is Ownable {struct Result{address token;uint256 marketCapUsd;uint256 updatedAt;}mapping(uint256=>Result) public dailyWinner;event DailyWinnerReported(uint256 indexed day,address indexed token,uint256 marketCapUsd);constructor(address reporter) Ownable(reporter){}function reportDailyWinner(uint256 day,address token,uint256 marketCapUsd) external onlyOwner{require(day<block.timestamp/1 days,"Day not closed");require(token!=address(0)&&marketCapUsd>0,"Invalid result");dailyWinner[day]=Result(token,marketCapUsd,block.timestamp);emit DailyWinnerReported(day,token,marketCapUsd);}}
