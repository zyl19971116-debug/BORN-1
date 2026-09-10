// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";

contract DailyMarketCapOracle is Ownable {
    struct Result { address token; uint256 marketCapUsd; uint256 updatedAt; }
    mapping(address => uint256) public currentMarketCapUsd;
    mapping(uint256 => address[]) private dailyTokens;
    mapping(uint256 => mapping(address => uint256)) public dailyMarketCapUsd;
    event MarketCapsUpdated(address[] tokens,uint256[] marketCapsUsd,uint256 updatedAt);
    event DailyRankingReported(uint256 indexed day,address[] tokens,uint256[] marketCapsUsd);
    constructor(address reporter) Ownable(reporter) {}
    function updateMarketCaps(address[] calldata tokens,uint256[] calldata caps) external onlyOwner {
        require(tokens.length==caps.length&&tokens.length>0,"Invalid data");
        for(uint256 i;i<tokens.length;i++){require(tokens[i]!=address(0),"Zero token");currentMarketCapUsd[tokens[i]]=caps[i];}
        emit MarketCapsUpdated(tokens,caps,block.timestamp);
    }
    function reportDailyRanking(uint256 day,address[] calldata tokens,uint256[] calldata caps) external onlyOwner {
        require(day<block.timestamp/1 days,"Day not closed");require(tokens.length==caps.length&&tokens.length>0,"Invalid data");delete dailyTokens[day];
        for(uint256 i;i<tokens.length;i++){require(tokens[i]!=address(0)&&caps[i]>0,"Invalid result");if(i>0)require(caps[i-1]>=caps[i],"Not sorted");dailyTokens[day].push(tokens[i]);dailyMarketCapUsd[day][tokens[i]]=caps[i];}
        emit DailyRankingReported(day,tokens,caps);
    }
    function getDailyRanking(uint256 day) external view returns(address[] memory tokens,uint256[] memory caps){tokens=dailyTokens[day];caps=new uint256[](tokens.length);for(uint256 i;i<tokens.length;i++)caps[i]=dailyMarketCapUsd[day][tokens[i]];}
    function dailyWinner(uint256 day) external view returns(address token,uint256 marketCapUsd,uint256 updatedAt){if(dailyTokens[day].length==0)return(address(0),0,0);token=dailyTokens[day][0];marketCapUsd=dailyMarketCapUsd[day][token];updatedAt=(day+1)*1 days;}
}
