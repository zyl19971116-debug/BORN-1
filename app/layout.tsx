import "./globals.css";import { Navbar } from "@/components/layout/navbar";import { Footer } from "@/components/layout/footer";import { WalletModal } from "@/components/wallet/wallet-modal";
export const metadata={title:"MEME//BORN — Every hour, one meme is born",description:"The internet chooses the next meme token."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/><main>{children}</main><Footer/><WalletModal/></body></html>}
