// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemeRegistry.sol";
import "./MemeTokenFactory.sol";

contract MemeVoting is Ownable {
    uint256 public constant ROUND_DURATION = 1 days;
    struct Round { uint256 roundId; uint256 startTime; uint256 endTime; uint256[] candidateMemeIds; uint256 winnerId; bool finalized; bytes32 seed; }
    MemeRegistry public immutable registry; MemeTokenFactory public immutable factory; uint256 public currentRoundId;
    mapping(uint256=>Round) private rounds; mapping(uint256=>mapping(uint256=>uint256)) private voteCounts;
    mapping(uint256=>mapping(address=>bool)) public walletHasVoted; mapping(uint256=>mapping(address=>uint256)) public walletVote;
    event RoundStarted(uint256 indexed roundId,uint256 startTime,uint256 endTime,uint256[] candidates);
    event VoteCast(uint256 indexed roundId,address indexed voter,uint256 indexed memeId);
    event RoundFinalized(uint256 indexed roundId,uint256 indexed winnerId,uint256 winningVotes,bool tiebreakerExecuted);
    constructor(address registry_,address factory_) Ownable(msg.sender){registry=MemeRegistry(registry_);factory=MemeTokenFactory(factory_);}
    function startRound(uint256[] calldata ids,bytes32 seed) external onlyOwner { require(currentRoundId==0||rounds[currentRoundId].finalized,"Active round");require(ids.length>=2,"Invalid round");uint256 id=++currentRoundId;Round storage r=rounds[id];r.roundId=id;r.startTime=block.timestamp;r.endTime=block.timestamp+ROUND_DURATION;r.seed=seed;for(uint i;i<ids.length;i++){r.candidateMemeIds.push(ids[i]);registry.setLive(ids[i],true);}emit RoundStarted(id,r.startTime,r.endTime,ids); }
    function vote(uint256 memeId) external { Round storage r=rounds[currentRoundId];require(block.timestamp<r.endTime,"Round ended");require(!walletHasVoted[currentRoundId][msg.sender],"Already voted");require(_candidate(r,memeId),"Not candidate");walletHasVoted[currentRoundId][msg.sender]=true;walletVote[currentRoundId][msg.sender]=memeId;voteCounts[currentRoundId][memeId]++;emit VoteCast(currentRoundId,msg.sender,memeId); }
    function finalizeRound() external returns(uint256 winner){Round storage r=rounds[currentRoundId];require(block.timestamp>=r.endTime,"Round active");require(!r.finalized,"Finalized");bool tie;uint256 best;bytes32 bestHash;for(uint i;i<r.candidateMemeIds.length;i++){uint id=r.candidateMemeIds[i];uint votes=voteCounts[currentRoundId][id];if(votes>best){best=votes;winner=id;tie=false;bestHash=keccak256(abi.encode(r.roundId,id,r.seed));}else if(votes==best){bytes32 h=keccak256(abi.encode(r.roundId,id,r.seed));if(winner!=0)tie=true;if(winner==0||uint256(h)<uint256(bestHash)){winner=id;bestHash=h;}}}r.winnerId=winner;r.finalized=true;for(uint i;i<r.candidateMemeIds.length;i++){uint id=r.candidateMemeIds[i];if(id!=winner)registry.setLive(id,false);}MemeRegistry.Meme memory m=registry.getMeme(winner);factory.deployWinnerToken(winner,m.name,m.ticker,m.metadataURI);emit RoundFinalized(r.roundId,winner,best,tie);}
    function getRound(uint256 id) external view returns(Round memory){return rounds[id];} function getVotes(uint256 roundId,uint256 memeId) external view returns(uint256){return voteCounts[roundId][memeId];} function getWinner(uint256 id) external view returns(uint256){return rounds[id].winnerId;}
    function _candidate(Round storage r,uint256 id) private view returns(bool){for(uint i;i<r.candidateMemeIds.length;i++)if(r.candidateMemeIds[i]==id)return true;return false;}
}
