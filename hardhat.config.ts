import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
const accounts=process.env.PRIVATE_KEY?[process.env.PRIVATE_KEY]:[];
const config:HardhatUserConfig={solidity:{version:"0.8.24",settings:{optimizer:{enabled:true,runs:200},viaIR:true}},networks:{hardhat:{},robinhood:{url:process.env.RH_RPC_URL||"https://rpc.mainnet.chain.robinhood.com",chainId:4663,accounts},robinhoodTestnet:{url:process.env.RH_TESTNET_RPC_URL||"https://rpc.testnet.chain.robinhood.com",chainId:46630,accounts}}};
export default config;
