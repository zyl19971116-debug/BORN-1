import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WalletModal } from "@/components/wallet/wallet-modal";
export const metadata = {
  title: "MEME//BORN — Every day, one meme is born",
  description: "The internet chooses one meme token every day.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WalletModal />
      </body>
    </html>
  );
}
