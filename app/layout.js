
import "./globals.css";
import Nav from "@/components/nav";
import { Toaster } from "sonner"
import ScrollProgress from "@/components/scroll-progress"
import ScrollToTop from "@/components/scroll-to-top"




export const metadata = {
  title: "Kwara SSCE ",
  description: "kwara state surveyor portal ",
  keywords: ["Surveyors", "Kwara State", "Nigeria", "SSCE"],
  authors: [{ name: "SSCE Kwara" }],
  creator: "SSCE Kwara",
  publisher: "SSCE Kwara",
  themeColor: "#4ade80",
  manifest: '/manifest.json',
  icons: {
    icon: "/surcon2.ico",
    pyramid: "/surcon2.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="bg-white text-black font-sans antialiased"
        style={{ scrollBehavior: "smooth" }}
      >
        <ScrollProgress/>
          {children} 
         <ScrollToTop/>
          <Toaster position="top-right" />
      </body>
    </html>
  );
}
