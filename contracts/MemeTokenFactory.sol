// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./MemeToken.sol";
import "./MemeRegistry.sol";

contract MemeTokenFactory {
    MemeRegistry public immutable registry;
    address public votingContract;
    address public immutable liquidityReceiver;
    event TokenDeployed(uint256 indexed memeId,address indexed token,string name,string ticker);
    modifier onlyVoting(){require(msg.sender==votingContract,"Voting only");_;}
    constructor(address registry_,address receiver_){registry=MemeRegistry(registry_);liquidityReceiver=receiver_;}
    function setVotingContract(address voting) external { require(votingContract==address(0),"Already set"); votingContract=voting; }
    function deployWinnerToken(uint256 memeId,string calldata name,string calldata ticker,string calldata metadataURI) external onlyVoting returns(address){
        MemeToken token=new MemeToken(name,ticker,metadataURI,liquidityReceiver); registry.markBorn(memeId,address(token)); emit TokenDeployed(memeId,address(token),name,ticker); return address(token);
    }
}
