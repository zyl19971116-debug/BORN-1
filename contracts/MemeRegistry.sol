// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeRegistry is Ownable {
    enum MemeStatus { UPCOMING, LIVE, BORN }
    struct Meme { uint256 id; string name; string ticker; string metadataURI; MemeStatus status; address tokenAddress; }
    mapping(uint256 => Meme) private memes;
    uint256 public memeCount;
    address public votingContract;
    address public factoryContract;

    event MemeAdded(uint256 indexed memeId, string name, string ticker);
    event MemeBorn(uint256 indexed memeId, address indexed tokenAddress);

    modifier onlyProtocol() { require(msg.sender == votingContract || msg.sender == factoryContract, "Protocol only"); _; }
    constructor() Ownable(msg.sender) {}
    function setProtocol(address voting, address factory) external onlyOwner { votingContract=voting; factoryContract=factory; }
    function addMeme(string calldata name,string calldata ticker,string calldata metadataURI) external onlyOwner returns(uint256 id){
        id=++memeCount; memes[id]=Meme(id,name,ticker,metadataURI,MemeStatus.UPCOMING,address(0)); emit MemeAdded(id,name,ticker);
    }
    function setLive(uint256 id,bool live) external onlyProtocol { require(memes[id].id!=0 && memes[id].status!=MemeStatus.BORN,"Invalid meme"); memes[id].status=live?MemeStatus.LIVE:MemeStatus.UPCOMING; }
    function markBorn(uint256 id,address token) external onlyProtocol { require(memes[id].status!=MemeStatus.BORN,"Already born"); require(token!=address(0),"Zero token"); memes[id].status=MemeStatus.BORN; memes[id].tokenAddress=token; emit MemeBorn(id,token); }
    function getMeme(uint256 id) external view returns(Meme memory){ return memes[id]; }
}
