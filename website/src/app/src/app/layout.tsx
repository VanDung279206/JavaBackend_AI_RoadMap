import "./globals.css";
import Navbar from "@/components/Navbar";
export default function Layout({children}:{children:React.ReactNode}){return <html><body><Navbar/>{children}</body></html>}