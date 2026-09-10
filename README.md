# MEME//BORN

每小时，互联网通过投票让一个 Meme 成为 Token。核心循环是：**投票 → 获胜 → 诞生 → 交易 → 下一轮**。

## 技术栈

Next.js 15、React 19、TypeScript、Tailwind CSS、Framer Motion、Zustand、Recharts、wagmi、viem、RainbowKit，以及 Solidity + Hardhat + OpenZeppelin。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。当前前端使用 Mock 链上数据和模拟钱包，包含首页、投票竞技场、已诞生列表、Meme 详情、模拟交易、排行榜、提名、钱包档案与玩法说明。

## 环境变量

复制 `.env.example` 为 `.env.local`。接入真实链时填写链 ID、三个合约地址和 WalletConnect Project ID。Mock 模式无需环境变量。

## 智能合约

```bash
npm run contracts:compile
npx hardhat run scripts/deploy.ts --network <network>
```

部署顺序由脚本自动处理：Registry → Factory → Voting → 权限绑定。Token 固定发行 10 亿枚，无增发入口、无团队或创建者预留；全部初始供应量发送至部署时设置的流动性接收地址。投票、轮次、获胜结果和 Token 地址以链上状态为准。

## 前端连接合约

1. 将部署输出写入 `.env.local`。
2. 在 wagmi 配置中启用目标链与 RPC。
3. 用合约读取替换 `data/memes.ts` 中的 Mock 轮次数据。
4. 监听 `RoundStarted`、`VoteCast`、`RoundFinalized`、`MemeBorn` 与 `TokenDeployed` 事件刷新 UI。
5. 将 `store/use-app-store.ts` 的模拟连接及投票替换成 RainbowKit 与 wagmi `useWriteContract`。

## 生产部署

先运行 `npm run build`，再部署至 Vercel 或任何支持 Next.js Node Runtime 的平台。生产环境应配置可靠 RPC、WalletConnect、PostgreSQL/Supabase（只存图片、描述、来源、审核和趋势数据）以及索引器；轮次、投票、获胜者和 Token 地址始终以链上为准。

## 原创视觉

首页 Meme Egg 主视觉由 OpenAI 图像生成工具为本项目生成；候选头像由前端代码生成，未使用知名品牌 Logo 或现有版权角色。
